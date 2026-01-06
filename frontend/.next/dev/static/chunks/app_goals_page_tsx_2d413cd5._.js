(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/goals/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoalsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$cognito$2d$identity$2d$provider$2f$dist$2d$es$2f$CognitoIdentityProviderClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/client-cognito-identity-provider/dist-es/CognitoIdentityProviderClient.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$cognito$2d$identity$2d$provider$2f$dist$2d$es$2f$commands$2f$UpdateUserAttributesCommand$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/client-cognito-identity-provider/dist-es/commands/UpdateUserAttributesCommand.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$cognito$2d$identity$2d$provider$2f$dist$2d$es$2f$CognitoIdentityProviderClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CognitoIdentityProviderClient"]({
    region: "eu-west-2"
});
function decodeJwtPayload(token) {
    const [, payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
}
function GoalsPage() {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        targetCalories: "",
        targetProtein: "",
        targetCarbs: "",
        targetFat: ""
    });
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [claims, setClaims] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoalsPage.useEffect": ()=>{
            const idToken = sessionStorage.getItem("id_token");
            if (idToken) {
                try {
                    setClaims(decodeJwtPayload(idToken));
                } catch (e) {
                    console.error("Failed to decode id_token", e);
                }
            }
        }
    }["GoalsPage.useEffect"], []);
    async function handleSubmit(e) {
        e.preventDefault();
        const accessToken = sessionStorage.getItem("access_token");
        const refreshToken = sessionStorage.getItem("refresh_token");
        if (!accessToken || !refreshToken) {
            setStatus("Missing tokens. Please login again.");
            return;
        }
        setStatus("Saving goals...");
        try {
            await client.send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$cognito$2d$identity$2d$provider$2f$dist$2d$es$2f$commands$2f$UpdateUserAttributesCommand$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["UpdateUserAttributesCommand"]({
                AccessToken: accessToken,
                UserAttributes: [
                    {
                        Name: "custom:targetCalories",
                        Value: form.targetCalories || "0"
                    },
                    {
                        Name: "custom:targetProtein",
                        Value: form.targetProtein || "0"
                    },
                    {
                        Name: "custom:targetCarbs",
                        Value: form.targetCarbs || "0"
                    },
                    {
                        Name: "custom:targetFat",
                        Value: form.targetFat || "0"
                    }
                ]
            }));
            const body = new URLSearchParams({
                grant_type: "refresh_token",
                client_id: "254veiurhs7i1dng9vf4p64fug",
                refresh_token: refreshToken
            });
            const res = await fetch("https://ai-coach-user-pool-login.auth.eu-west-2.amazoncognito.com/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body.toString()
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            const tokens = await res.json();
            sessionStorage.setItem("access_token", tokens.access_token);
            sessionStorage.setItem("id_token", tokens.id_token);
            if (tokens.refresh_token) {
                sessionStorage.setItem("refresh_token", tokens.refresh_token);
            }
            try {
                setClaims(decodeJwtPayload(tokens.id_token));
            } catch (err) {
                console.error("Failed to decode refreshed id_token", err);
            }
            setStatus("Goals saved and tokens refreshed.");
        } catch (err) {
            setStatus(`Update failed: ${err.message ?? String(err)}`);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            maxWidth: 420,
            margin: "40px auto",
            display: "flex",
            flexDirection: "column",
            gap: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Set your goals"
            }, void 0, false, {
                fileName: "[project]/app/goals/page.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: "Target calories",
                        value: form.targetCalories,
                        onChange: (e)=>setForm({
                                ...form,
                                targetCalories: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/goals/page.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: "Target protein",
                        value: form.targetProtein,
                        onChange: (e)=>setForm({
                                ...form,
                                targetProtein: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/goals/page.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: "Target carbs",
                        value: form.targetCarbs,
                        onChange: (e)=>setForm({
                                ...form,
                                targetCarbs: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/goals/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: "Target fat",
                        value: form.targetFat,
                        onChange: (e)=>setForm({
                                ...form,
                                targetFat: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/goals/page.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        children: "Save goals"
                    }, void 0, false, {
                        fileName: "[project]/app/goals/page.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/goals/page.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: status
            }, void 0, false, {
                fileName: "[project]/app/goals/page.tsx",
                lineNumber: 126,
                columnNumber: 18
            }, this),
            claims && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                style: {
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 4
                },
                children: JSON.stringify({
                    email: claims.email,
                    custom: {
                        targetCalories: claims["custom:targetCalories"],
                        targetProtein: claims["custom:targetProtein"],
                        targetCarbs: claims["custom:targetCarbs"],
                        targetFat: claims["custom:targetFat"]
                    }
                }, null, 2)
            }, void 0, false, {
                fileName: "[project]/app/goals/page.tsx",
                lineNumber: 128,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/goals/page.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
_s(GoalsPage, "zRBSFhQlNXxMbLH29uzFvJYZJPE=");
_c = GoalsPage;
var _c;
__turbopack_context__.k.register(_c, "GoalsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_goals_page_tsx_2d413cd5._.js.map