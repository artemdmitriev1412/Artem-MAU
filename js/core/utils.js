/* Общие утилиты: доступ к DOM. */

const $ = (id) => document.getElementById(id);
const CATALOG_ONLY = new URLSearchParams(location.search).has("catalog");
