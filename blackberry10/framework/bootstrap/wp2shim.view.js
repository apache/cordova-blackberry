var fragment = document.createDocumentFragment(),
    uiScript = document.createElement("script"),
    requireScript,
    i18nScript = document.createElement("script"),
    wpScript,
    cssLink = document.createElement("link");

cssLink.rel = "stylesheet";
cssLink.type = "text/css";
cssLink.media = "screen";
cssLink.charset = "utf-8";


if (window.wp) {
    cssLink.href = "platform:///ui/styles/styles.css";
} else {
    requireScript = document.createElement("script");
    wpScript = document.createElement("script");
    requireScript.src = "./require.js";
    wpScript.src = "platform:///webplatform.js";
    uiScript.src = "platform:///ui-resources/index.js";
    cssLink.href = "platform:///ui-resources/styles/styles.css";
    fragment.appendChild(requireScript);
    fragment.appendChild(wpScript);
    fragment.appendChild(uiScript);
}

i18nScript.src = "platform:///i18n.js";
fragment.appendChild(cssLink);
fragment.appendChild(i18nScript);
document.head.appendChild(fragment);
