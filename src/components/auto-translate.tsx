'use client';

import { useEffect, useRef, useState } from 'react';
import { hasTranslation, registerTranslations, translateFromDictionary } from '../lib/i18n/dictionary';
import type { Locale } from '../lib/i18n/config';
import { useI18n } from './language-provider';

type NodeState = { original: string; applied?: string };
type AttrState = Record<string, { original: string; applied?: string }>;

const textState = new WeakMap<Text, NodeState>();
const attrState = new WeakMap<Element, AttrState>();

const ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'KBD', 'SAMP']);
const MAX_PHRASE = 160;

/** Phrases already sent for translation, so a page never asks twice. */
const requested = new Set<string>();
/** Kept below the translator route's per-request cap so no phrase is silently dropped. */
const MAX_PHRASES_PER_REQUEST = 30;
const REQUESTS_PER_PASS = 3;
/** After a provider error or rate limit, pause instead of hammering the route. */
let pausedUntil = 0;

const CACHE_KEY = 'dammi.i18n.cache.v1';
type Cache = Partial<Record<Locale, Record<string, string>>>;

function readCache(): Cache {
  try {
    return (JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Cache) || {};
  } catch {
    return {};
  }
}

function writeCache(locale: Locale, entries: Record<string, string>) {
  try {
    const cache = readCache();
    cache[locale] = { ...(cache[locale] || {}), ...entries };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage can be blocked; the visit still translates */
  }
}

function shouldSkip(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest('[data-no-i18n]')) return true;
  if (parent.closest('svg')) return true;
  return false;
}

function looksTranslatable(text: string) {
  if (text.length < 2 || text.length > MAX_PHRASE) return false;
  if (!/[A-Za-z]{2}/.test(text)) return false;
  if (/^https?:|^\/|^[\w.-]+@[\w.-]+$/.test(text)) return false;
  if (/^\d+([.,:/-]\d+)?$/.test(text)) return false;
  return true;
}

function localiseTextNode(node: Text, locale: Locale, misses: string[]) {
  const current = node.data;
  const state = textState.get(node);

  // If the app replaced the text itself, that new text is the new source string.
  if (state && current !== state.applied) state.original = current;
  const original = state?.original ?? current;
  const core = original.trim();
  if (!core || core.length > MAX_PHRASE) return;

  const translated = locale === 'en' ? original : translateFromDictionary(original, locale);
  if (state) state.applied = translated;
  else textState.set(node, { original, applied: translated });
  if (translated !== current) node.data = translated;

  if (locale !== 'en' && !hasTranslation(original, locale) && looksTranslatable(core)) misses.push(core);
}

function localiseElement(element: Element, locale: Locale, misses: string[]) {
  if (SKIP_TAGS.has(element.tagName)) return;
  const saved = attrState.get(element) || {};

  ATTRIBUTES.forEach(attribute => {
    const current = element.getAttribute(attribute);
    if (!current || !current.trim() || current.trim().length > MAX_PHRASE) return;

    const previous = saved[attribute];
    if (previous && current !== previous.applied) previous.original = current;
    const original = previous?.original ?? current;
    const translated = locale === 'en' ? original : translateFromDictionary(original, locale);

    saved[attribute] = { original, applied: translated };
    if (translated !== current) element.setAttribute(attribute, translated);

    if (locale !== 'en' && !hasTranslation(original, locale) && looksTranslatable(original.trim())) {
      misses.push(original.trim());
    }
  });

  attrState.set(element, saved);
}

/**
 * Translates rendered page text into the active language.
 *
 * Two passes: a curated dictionary resolves the school's own wording instantly,
 * then any phrase without an entry is translated once by the AI translator and
 * cached, so every page — course copy included — follows the language switch.
 */
export default function AutoTranslate() {
  const { locale, ready } = useI18n();
  const [version, setVersion] = useState(0);
  const inFlight = useRef(false);

  // Warm the runtime overlay from the browser cache whenever the language changes.
  useEffect(() => {
    if (!ready || locale === 'en') return;
    const cached = readCache()[locale];
    if (cached && Object.keys(cached).length) {
      registerTranslations(locale, cached);
      setVersion(value => value + 1);
    }
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) return;

    let frame = 0;
    const run = () => {
      frame = 0;
      const root = document.body;
      if (!root) return;

      const misses: string[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const text = node as Text;
        if (!shouldSkip(text)) localiseTextNode(text, locale, misses);
        node = walker.nextNode();
      }

      root.querySelectorAll('*').forEach(element => {
        if (!element.closest('[data-no-i18n]')) localiseElement(element, locale, misses);
      });

      if (locale === 'en' || inFlight.current) return;
      if (Date.now() < pausedUntil) return;

      const pending = [...new Set(misses)].filter(text => !requested.has(`${locale}:${text}`));
      if (!pending.length) return;

      // Several small requests per pass so a text-heavy page finishes quickly.
      const batches: string[][] = [];
      for (let index = 0; index < pending.length && batches.length < REQUESTS_PER_PASS; index += MAX_PHRASES_PER_REQUEST) {
        batches.push(pending.slice(index, index + MAX_PHRASES_PER_REQUEST));
      }

      batches.forEach(texts => texts.forEach(text => requested.add(`${locale}:${text}`)));
      inFlight.current = true;

      Promise.all(batches.map(texts => fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, texts }),
      })
        .then(async response => {
          if (response.ok) return { texts, data: await response.json() };
          // Rate limited or provider down: back off, and let these phrases be retried later.
          pausedUntil = Date.now() + (response.status === 429 ? 1000 * 60 * 5 : 1000 * 15);
          return { texts, data: null };
        })
        .catch(() => ({ texts, data: null }))))
        .then(responses => {
          const merged: Record<string, string> = {};
          responses.forEach(({ texts, data }) => {
            const translations = (data?.translations || {}) as Record<string, string>;
            // Anything the service did not answer goes back in the queue for the next pass.
            texts.forEach(text => {
              if (translations[text]) merged[text] = translations[text];
              else requested.delete(`${locale}:${text}`);
            });
          });
          if (!Object.keys(merged).length) return;
          registerTranslations(locale, merged);
          writeCache(locale, merged);
          setVersion(value => value + 1);
        })
        .catch(() => undefined)
        .finally(() => {
          inFlight.current = false;
        });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(run);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale, ready, version]);

  return null;
}
