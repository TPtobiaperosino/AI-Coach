module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/Login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// this will be the front door of the app
// I need to send the user to Cognito, I'm delegating the authentication to Cognito
// The login button just sends the browser to Cognito --> it is a redirect
// If cognito authorises the user and login works, Cognito gives to the browser a code and dends the browser back to the app
// Code is just used at every login OAuth when a new JWT is needed and lasts a few minutes
// Browser goes back to the app with a URL like "http://localhost:3000/callback?code=ABC123" which is the address of the callback page
// The callback page is made of HTML and JS run by the browser when it goes through the corresponding URL
// A URL is associated to a page through Next.js --> I create the callback page associated to the URL with the code so browser when it reads it loads the callback page
// The browser, loads the page and execues the JS inside it. JS finds the code and extracts it.
// Callback will be used to get the JWT, with a library Auth callback will be read, and then code exchanged with the JWT with Cognito
// The JS, after reading the code calls an Amplify Auth function or a manual fetch --> makes http request to Cognito --> exchanges the code with the JWT
// Just for reference --> fetch is a way to ask data to a server without changing page
// Therefore I need to build a login button that does a redirect for the browser towards Cognito. --> window.location.href = "https://your-cognito-domain/login?...";
// I'll use TypeScript + JSX using react withing the Next.js framework
"use client"; // Debug ERROR 1 --> the code below runs in the browser so I need to use Client Component
;
function HomePage() {
    // defining the page; export default makes this component importable as default
    function generateState() {
        const array = new Uint8Array(16);
        // creating an array of 16 cells, each cell = 1 byte (binary-safe array)
        crypto.getRandomValues(array);
        // browser crypto API, secure and non-predictable (Math.random is predictable)
        return Array.from(array).map((b)=>b.toString(16).padStart(2, "0")).join("");
    }
    // map() converts values
    // toString(16) converts to hex (e.g. 10 = "a")
    // padStart ensures 2 digits per byte
    function handleLogin() {
        // in React, pages are components (functions)
        const state = generateState();
        sessionStorage.setItem("oauth_state", state);
        // saving state in browser storage (key-value)
        const cognitoDomain = "https://ai-fitness-coach-tobia.auth.eu-west-2.amazoncognito.com";
        const clientId = "4bno9kh90ejdpvj4kqvcjn9c8e";
        const redirectUri = encodeURIComponent("http://localhost:3000/callback"); // must match exactly the callback URL in Cognito
        const scope = encodeURIComponent("openid email profile");
        // 
        const url = `${cognitoDomain}/oauth2/authorize` + `?response_type=code` + `&client_id=${clientId}` + `&redirect_uri=${redirectUri}` + `&scope=${scope}` + `&state=${state}`;
        window.location.href = url;
    // browser redirect to Cognito Hosted UI
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleLogin,
            children: "Login"
        }, void 0, false, {
            fileName: "[project]/app/Login/page.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/Login/page.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
} //ERROR 1: on Click does not work and gives error because:
 // Code runs on:
 //1) Server --> remote computer which generates HTML, does not see clicks, browser, does not have browser console
 //2) Browser: Chrome e.g., sees clicks, buttons, eruns JS, can do redirect --> clicks can be seen only in the browser
 // In Next.js pages run on server, not in the browser (this makes everything faster and better SEO)
 // 2 types of component --> (i) Server which is default and (ii) Client which runs in the browser
 // !!!! I need to tell to Next.js that I want this component running on the browser (make it client) --> to do so I need to write at the beginning "use client"
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8b72245f._.js.map