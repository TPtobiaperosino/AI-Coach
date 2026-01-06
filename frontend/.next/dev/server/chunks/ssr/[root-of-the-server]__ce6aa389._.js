module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
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
"use client"; //Debug ERROR 1 --> the code below runs in the browser so I need to use Client Component
;
;
function HomePage() {
    function generateState() {
        const array = new Uint8Array(16); //creating array of 16 cells, each cell = 1 byte --> is a speicial array though, is not for UI (e.g. values admitted from 0 to 255), is a binary array
        crypto.getRandomValues(array); //object of the browser, is to store safely, is not predictable (Match.random is predicatble). getrandomValues is a method of crypto
        return Array.from(array).map((b)=>b.toString(16).padStart(2, "0")).join(""); //conversion to an Array adapt to be used in UI
    }
    //map replace, toString just translate from hex (e.g. 10 = a), pad start makes sure there are 2 digits to rebuild then the original bytes
    function handleLogin() {
        //  console.log("login clicked") --> I can remove it, now I know it works in the browser //console = tool of the browser to print messages and see errors in the debug area
        const state = generateState();
        sessionStorage.setItem("oauth_state", state); //object of the browser, im saving tsatte in the browser as key value (oauth_state is the key)
        const cognitoDomain = "https://ai-coach-user-pool-login.auth.eu-west-2.amazoncognito.com";
        const clientId = "17ior5lk7vcmim6gdp48eu1138";
        const redirectUri = encodeURIComponent("http://localhost:3000/callback") // must match esattamente il callback URL in Cognito
        ;
        const scope = encodeURIComponent("openid email profile");
        const url = `${cognitoDomain}/oauth2/authorize` + `?response_type=code` + `&client_id=${clientId}` + `&redirect_uri=${redirectUri}` + `&scope=${scope}` + `&state=${state}`;
        window.location.href = url; // window is the browser, location is a property of window (current address of the page), href is the url --> so I'm assigning new url basically
    } //log = print text in the console
    // in general this function is to track clicks.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleLogin,
                children: "Login"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/signup",
                style: {
                    marginLeft: 12
                },
                children: "Create account"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 54,
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ce6aa389._.js.map