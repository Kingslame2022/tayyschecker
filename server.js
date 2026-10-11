<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>WhatsApp Banchecker</title>
    <link rel="icon" type="image/png" href="/icon.png">
    <link rel="manifest" href="/manifest.json">
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

    <style>
        :root {
            --primary-color: #8a2be2;
            --text-color: #ffffff;
            --ios-bg: rgba(20, 20, 20, 0.08); 
            --ios-border: rgba(255, 255, 255, 0.12);
            --panel-bg: rgba(20, 20, 20, 0.08);
            --panel-blur: 8px;
            --popup-blur: 12px;
            --bg-opacity: 0.4;
        }

        * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
        }
        
        body, html { 
            height: 100%; 
            width: 100%; 
            background-color: #050505; 
            color: var(--text-color); 
            overflow-x: hidden; 
            display: flex; 
            justify-content: center;
        }

        /* --- START SCREEN --- */
        #start-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(5, 5, 5, 0.55);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 80px 20px 60px 20px;
            transition: opacity 0.5s ease, visibility 0.5s;
        }

        #start-screen.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .welcome-text {
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--text-color);
            text-align: center;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
        }

        .start-bottom {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 320px;
        }

        .start-by {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 15px;
            letter-spacing: 1px;
        }

        .agree-btn {
            width: 100%;
            padding: 14px;
            background: transparent;
            border: 1px solid var(--primary-color);
            border-radius: 30px;
            color: var(--primary-color);
            font-size: 0.9rem;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s;
        }

        .agree-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 15px rgba(138, 43, 226, 0.2);
        }

        /* --- BILD & GIF HINTERGRUND --- */
        #bg-img {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            z-index: 1; 
            opacity: var(--bg-opacity); 
            display: none; 
        }

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, transparent 30%, rgba(0,0,0,0.85) 95%);
            z-index: 2; 
            pointer-events: none;
        }

        /* --- HAUPTLAYOUT --- */
        .app-container { 
            width: 100%; 
            max-width: 420px; 
            min-height: 100vh; 
            padding: 40px 20px 20px 20px; 
            display: flex; 
            flex-direction: column; 
            position: relative;
            z-index: 10; 
        }

        .header {
            text-align: center; 
            font-size: 1.25rem; 
            letter-spacing: 3px;
            margin-bottom: 35px; 
            position: relative; 
            color: var(--text-color);
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
            z-index: 20;
        }

        .dots { 
            position: absolute; 
            right: 0; 
            top: 0; 
            font-size: 1.4rem; 
            cursor: pointer; 
            padding: 0 10px;
        }

        /* --- STANDARD iOS STYLES --- */
        .top-block-container {
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur));
            -webkit-backdrop-filter: blur(var(--panel-blur));
            margin-bottom: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
        }

        .top-panel {
            display: flex;
            text-align: center;
            border-bottom: 1px solid var(--primary-color);
        }

        .top-panel > div {
            flex: 1; 
            padding: 12px; 
            cursor: pointer;
            transition: background 0.2s, text-shadow 0.2s; 
            color: var(--text-color);
            font-weight: 500;
        }

        .top-panel > div:hover { 
            background: rgba(255,255,255,0.08); 
        }

        .border-right { 
            border-right: 1px solid var(--primary-color); 
        }
        
        .check-btn-area { 
            letter-spacing: 1px; 
        }

        .check-btn-area:hover { 
            text-shadow: 0 0 8px var(--primary-color); 
        }

        .extra-field-wrapper {
            display: none; 
            margin-bottom: 10px;
        }
        
        .extra-field-wrapper input {
            width: 100%;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur));
            -webkit-backdrop-filter: blur(var(--panel-blur));
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            padding: 10px;
            color: rgba(255,255,255,0.7);
            text-align: center;
            outline: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-size: 0.85rem;
            letter-spacing: 1px;
        }

        .input-wrapper { 
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur));
            -webkit-backdrop-filter: blur(var(--panel-blur));
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            margin-bottom: 6px; 
            padding-bottom: 4px; 
            position: relative;
        }

        .input-panel {
            display: flex; 
            align-items: center;
            padding: 12px 15px;
        }

        .input-panel span { 
            color: var(--text-color); 
            margin-right: 10px; 
            font-weight: bold;
            font-size: 1.1rem;
        }

        input[type="text"], input[type="password"], input[type="number"] {
            background: transparent; 
            border: none; 
            color: var(--text-color);
            font-size: 1.05rem; 
            outline: none; 
            letter-spacing: 1px;
            text-shadow: 0 0 5px rgba(0,0,0,0.8);
            width: 100%;
        }

        #country-code { 
            width: 45px; 
            border-right: 1px solid var(--primary-color); 
            padding-right: 10px; 
            margin-right: 10px; 
            text-align: center;
        }

        #phone-number { 
            flex: 1; 
        }

        .progress-bar-container {
            width: 90%; 
            height: 3px; 
            background: rgba(255,255,255,0.1); 
            margin: 0 auto; 
            border-radius: 3px; 
            overflow: hidden;
            position: relative;
        }

        .progress-bar {
            height: 100%; 
            width: 40%; 
            background: var(--primary-color);
            position: absolute; 
            top: 0; 
            left: 0;
            box-shadow: 0 0 10px var(--primary-color);
            animation: scanLine 2s infinite alternate ease-in-out;
        }

        @keyframes scanLine {
            0% { left: 0%; width: 25%; }
            50% { width: 50%; }
            100% { left: 75%; width: 25%; }
        }

        .copyright { 
            text-align: center; 
            font-size: 0.55rem; 
            color: rgba(255,255,255,0.5); 
            margin-bottom: 25px; 
            letter-spacing: 1.5px;
            text-shadow: 0 0 3px rgba(0,0,0,0.8);
        }

        /* --- ANDROID (HACKER) THEME OVERRIDES --- */
        body.theme-android {
            --panel-bg: rgba(10, 10, 10, 0.6);
        }

        body.theme-android .top-block-container,
        body.theme-android .input-wrapper,
        body.theme-android .desktop-result {
            background: rgba(10, 10, 10, 0.4); 
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            box-shadow: 0 0 8px rgba(0,0,0,0.8);
        }

        body.theme-android .extra-field-wrapper input {
            color: rgba(255,255,255,0.5); 
        }

        body.theme-android .input-wrapper {
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur));
            padding-bottom: 5px; 
            box-shadow: 0 0 8px rgba(0,0,0,0.8);
        }

        body.theme-android .input-panel {
            border: none;
            background: transparent;
            box-shadow: none;
        }

        body.theme-android .progress-bar-container {
            width: 90%;
            margin-top: 0;
        }

        body.theme-android .desktop-result {
            background: var(--panel-bg); 
            backdrop-filter: blur(var(--panel-blur)); 
            border: 1px solid var(--primary-color);
            box-shadow: 0 0 10px rgba(0,0,0,0.8);
            border-radius: 12px;
            padding: 18px 20px;
        }

        body.theme-android .desktop-num {
            text-align: left;
            font-size: 1.15rem;
            margin-bottom: 10px;
        }

        body.theme-android .desktop-msg {
            text-align: left;
            font-size: 1.05rem;
            margin-bottom: 20px;
        }

        body.theme-android .desktop-actions {
            justify-content: flex-end;
            gap: 25px;
        }

        /* CUSTOM LOADER BEREICH */
        #loading-wrapper { 
            display: none; 
            text-align: center; 
            margin-bottom: 12px; 
        }

        #loading-icon { 
            width: 50px; 
            height: 50px; 
            display: none; 
            margin: 0 auto 10px auto; 
            border-radius: 50%; 
            object-fit: cover; 
        }

        #loading-text { 
            color: var(--primary-color); 
            font-weight: 500; 
            text-shadow: 0 0 5px rgba(0,0,0,0.8); 
        }
        
        @keyframes spin { 
            100% { transform: rotate(360deg); } 
        }

        #error-message { 
            color: #ff4d4d; 
            text-align: center; 
            margin-bottom: 12px; 
            display: none; 
            font-size: 0.9rem; 
        }

        /* --- RESULT BOXEN --- */
        #result-wrapper { 
            display: none; 
            margin-bottom: 20px; 
        }
        
        .desktop-result {
            position: relative;
            border: 1px solid var(--primary-color);
            border-radius: 12px; 
            padding: 22px 20px 18px 20px;
            background: rgba(20, 20, 25, 0.18);
            backdrop-filter: blur(var(--popup-blur));
            -webkit-backdrop-filter: blur(var(--popup-blur));
            box-shadow: 0 0 18px rgba(255,0,51,0.25);
        }

        .desktop-num { 
            font-size: 1.05rem; 
            font-weight: bold; 
            margin-bottom: 10px; 
            text-align: left; 
            text-shadow: 0 0 5px rgba(0,0,0,0.8); 
        }

        .desktop-msg { 
            font-style: italic; 
            font-size: 0.95rem; 
            margin-bottom: 25px; 
            text-align: left; 
            font-weight: 600;
            text-shadow: 0 0 5px rgba(0,0,0,0.8); 
        }

        .desktop-actions { 
            display: flex; 
            justify-content: flex-end; 
            gap: 20px;
            font-size: 0.85rem; 
            font-weight: bold;
            text-transform: uppercase; 
        }

        .desktop-actions span { 
            cursor: pointer; 
            letter-spacing: 1px;
            transition: color 0.2s;
            text-shadow: 0 0 5px rgba(0,0,0,0.8); 
        }

        .desktop-actions span:hover { 
            color: var(--primary-color); 
        }

        .mobile-result { 
            display: none; 
        }

        .ios-overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh;
            background: rgba(0,0,0,0.3); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            z-index: 4000; 
        }

        @keyframes popupSlideUpFade { 
            0% { opacity: 0; transform: translateY(40px); } 
            100% { opacity: 1; transform: translateY(0); } 
        }

        .ios-modal {
            position: relative;
            background: var(--ios-bg);
            backdrop-filter: blur(var(--popup-blur)); 
            -webkit-backdrop-filter: blur(var(--popup-blur));
            border-radius: 14px; 
            width: 275px; 
            text-align: center; 
            color: var(--text-color);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.12);
            animation: popupSlideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .ios-text { 
            padding: 24px 14px 20px 14px; 
            font-size: 0.95rem; 
            font-weight: 500;
            line-height: 1.35; 
        }

        #mob-num { 
            display: block; 
            margin: 8px 0; 
            font-size: 1.05rem; 
            font-weight: 600; 
        }

        #mob-system-text { 
            display: block; 
            margin-top: 12px; 
            font-size: 0.85rem; 
        }

        .ios-buttons { 
            display: flex; 
            border-top: 1px solid var(--ios-border); 
        }

        .ios-buttons button { 
            flex: 1; 
            padding: 13px; 
            background: none; 
            border: none;
            font-size: 1rem; 
            color: var(--primary-color); 
            cursor: pointer;
            transition: background 0.2s; 
        }

        .ios-buttons button:active { 
            background: rgba(255,255,255,0.1); 
        }

        .ios-buttons button:first-child { 
            border-right: 1px solid var(--ios-border); 
            color: var(--primary-color); 
        }

        .ios-buttons button:last-child { 
            font-weight: 600; 
        }

        @media (max-width: 768px) {
            .desktop-result { display: none; }
            .mobile-result.active { display: block; }
            
            body.theme-android .desktop-result.active { display: block; }
            body.theme-android .mobile-result.active { display: none !important; }
        }

        @media (min-width: 769px) {
            .desktop-result.active { display: block; }
            .mobile-result { display: none !important; }
        }

        /* --- SLIDE-UP MENÜS --- */
        .settings-backdrop { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 3000; 
            display: none; 
            justify-content: center;
            align-items: flex-end; 
        }

        .settings-backdrop.active { 
            display: flex; 
        }

        .settings-panel { 
            width: 100%; 
            max-width: 420px; 
            border-top: 1px solid var(--primary-color);
            border-left: 1px solid var(--primary-color);
            border-right: 1px solid var(--primary-color);
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
            padding: 22px 20px 35px 20px; 
            background: rgba(20, 20, 28, 0.92);
            backdrop-filter: blur(25px);
            box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
            max-height: 85vh; 
            overflow-y: auto; 
        }

        .settings-backdrop.active .settings-panel { 
            transform: translateY(0); 
        }
        
        .settings-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 18px; 
        }

        .settings-title { 
            font-size: 0.9rem; 
            color: var(--text-color); 
            opacity: 0.9; 
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: bold;
            cursor: pointer; 
            user-select: none; 
        }

        .close-settings { 
            background: none; 
            border: none; 
            color: var(--text-color);
            font-size: 1.3rem; 
            cursor: pointer; 
            opacity: 0.8; 
            padding: 5px; 
        }

        .category-box {
            background: rgba(0,0,0,0.3); 
            padding: 15px; 
            border-radius: 12px; 
            margin-bottom: 20px; 
            border: 1px solid rgba(255,255,255,0.08);
        }

        .category-title {
            font-size: 0.85rem; 
            margin-bottom: 15px; 
            font-weight: bold; 
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .settings-row { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            margin-bottom: 14px; 
            font-size: 0.85rem; 
        }
        
        input[type="color"] { 
            -webkit-appearance: none; 
            border: none; 
            width: 30px; 
            height: 30px; 
            border-radius: 6px; 
            cursor: pointer; 
            padding: 0; 
            background: transparent; 
        }

        input[type="color"]::-webkit-color-swatch { 
            border: 1px solid rgba(255,255,255,0.4); 
            border-radius: 6px; 
        }

        .edit-text-btn, .action-btn { 
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--primary-color);
            color: var(--text-color);
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s; 
        }

        .edit-text-btn:hover, .action-btn:hover { 
            background: rgba(255,255,255,0.2); 
        }
        
        input[type="file"] { 
            width: 100%; 
            padding: 6px; 
            border: 1px dashed var(--primary-color);
            color: var(--text-color);
            border-radius: 6px;
            font-size: 0.75rem; 
            cursor: pointer; 
            margin-top: 6px;
            background: rgba(0,0,0,0.4); 
        }

        input[type="file"]::file-selector-button { 
            background: transparent; 
            border: 1px solid var(--primary-color);
            color: var(--text-color);
            padding: 4px 10px;
            border-radius: 4px; 
            cursor: pointer; 
            margin-right: 8px;
            font-size: 0.75rem; 
        }
        
        select.glass-select { 
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--primary-color);
            color: var(--text-color);
            padding: 4px 8px;
            border-radius: 6px;
            outline: none;
            font-size: 0.85rem;
            cursor: pointer; 
        }

        select.glass-select option { 
            background: #1a1a1a; 
            color: #fff; 
        }

        .owner-input { 
            width: 100%; 
            padding: 10px; 
            margin-bottom: 10px; 
            border-radius: 6px;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
            color: white; 
        }

        .owner-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
            font-size: 0.8rem; 
        }
        
        .owner-table th, .owner-table td { 
            border: 1px solid rgba(255,255,255,0.2); 
            padding: 8px; 
            text-align: left; 
        }

        .owner-table th { 
            color: var(--primary-color); 
        }

        /* --- CHAT SYSTEM STYLES --- */
        .chat-messages { 
            flex: 1; 
            overflow-y: auto; 
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch; 
            padding: 15px; 
            display: flex; 
            flex-direction: column; 
            gap: 10px; 
        }

        .chat-msg { 
            background: rgba(0,0,0,0.4); 
            padding: 8px 12px; 
            border-radius: 8px; 
            border: 1px solid rgba(255,255,255,0.05); 
            font-size: 0.85rem; 
            word-wrap: break-word; 
        }

        .chat-msg-admin { 
            border: 1px solid red; 
            background: rgba(255,0,0,0.1); 
        }

        .chat-name { 
            font-weight: bold; 
            font-size: 0.75rem; 
            color: var(--primary-color); 
            margin-bottom: 3px; 
            display: flex; 
            justify-content: space-between; 
        }

        .chat-name-admin { 
            color: red; 
        }

        .chat-time { 
            font-size: 0.65rem; 
            color: rgba(255,255,255,0.4); 
            font-weight: normal; 
        }

        .chat-input-area { 
            padding: 10px; 
            border-top: 1px solid var(--primary-color); 
            display: flex; 
            gap: 8px; 
            background: rgba(0,0,0,0.2); 
            border-bottom-left-radius: 18px; 
            border-bottom-right-radius: 18px; 
        }

        .chat-input-area input {
            flex: 1; 
            padding: 15px; 
            font-size: 1rem; 
            border-radius: 8px; 
            background: rgba(0,0,0,0.5); 
            border: 1px solid rgba(255,255,255,0.2); 
            color: white; 
            outline: none;
        }

        .chat-input-area button {
            background: var(--primary-color); 
            color: white; 
            border: none; 
            padding: 0 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-weight: bold; 
            font-size: 1.1rem;
        }
    </style>
</head>
<body>

    <!-- START SCREEN -->
    <div id="start-screen">
        <div class="welcome-text" id="welcome-display">🔥 Welcome Back my Master 🔥</div>
        <div class="start-bottom">
            <div class="start-by">by Tayy</div>
            <button class="agree-btn" onclick="startApp()" data-i18n="agree_btn">AGREE AND CONTINUE</button>
        </div>
    </div>

    <!-- ANNOUNCEMENT POPUP -->
    <div id="announcement-modal" class="ios-overlay" style="display: none;">
        <div class="ios-modal">
            <div class="ios-text">
                <strong id="ann-title" style="display:block; margin-bottom:10px; font-size:1.1rem; color:var(--primary-color);">Ankündigung</strong>
                <span id="ann-content">Hier steht der Text...</span>
            </div>
            <div class="ios-buttons">
                <button onclick="closeAnnouncement()" style="border-right: none; font-weight: bold;" data-i18n="understood">Verstanden</button>
            </div>
        </div>
    </div>

    <img id="bg-img" alt="background">
    <div class="overlay"></div>

    <div class="app-container">
        <div class="header">スノウィ <span class="dots" onclick="toggleSettings(true)">⋮</span></div>

        <!-- 1:1 CONNECTED TOP BLOCK WIE AUF BILD -->
        <div class="top-block-container">
            <div class="top-panel" style="margin-bottom: 0; border: none; border-bottom: 1px solid var(--primary-color); border-radius: 0; box-shadow: none;">
                <div class="border-right" onclick="pasteFromClipboard()" data-i18n="autofill">Autofill</div>
                <div class="check-btn-area" onclick="checkNumber()">スノウィ</div>
            </div>
            <div class="extra-field-wrapper" style="display: block;">
                <input type="text" id="custom-extra-note" placeholder="Notiz / IP / Info..." oninput="saveExtraNote(this.value)">
            </div>
        </div>

        <div class="input-wrapper">
            <div class="input-panel">
                <span>+</span>
                <input type="text" id="country-code" value="49" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                <input type="text" id="phone-number" placeholder="15678332333" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
        </div>
        
        <!-- Enger am Input-Block -->
        <div class="copyright">©Made by Tayy</div>

        <!-- CUSTOM LOADER -->
        <div id="loading-wrapper">
            <img id="loading-icon" src="" alt="Loader">
            <div id="loading-text" data-i18n="api_loading">API wird abgefragt...</div>
        </div>
        <div id="error-message"></div>

        <!-- RESULTAT BEREICH (Gleich für PC und Mobile im Hacker-Theme!) -->
        <div id="result-wrapper">
            <div class="desktop-result" id="desktop-view">
                <div class="desktop-num" id="desk-num">+49 175 2821649</div>
                <div class="desktop-msg" id="desk-msg" style="color: var(--text-color);">Banned by ViVa La Tayy</div>
                <div class="desktop-actions">
                    <span onclick="closeResult()">EXIT...</span>
                    <span onclick="openSupport()" data-i18n="support_desk">サポート</span>
                </div>
            </div>
            <div class="mobile-result" id="mobile-view">
                <div class="ios-overlay" style="background: transparent;">
                    <div class="ios-modal">
                        <div class="ios-text" id="mobile-msg">
                            <span data-i18n="your_phone">Deine Telefonnummer</span>
                            <strong id="mob-num">+49 175 2821649</strong>
                            <span id="mob-custom-text">Banned by ViVa La Tayy</span>
                            <span id="mob-system-text" data-i18n="contact_support">Bitte kontaktiere unseren Customer Support für weitere Hilfe.</span>
                        </div>
                        <div class="ios-buttons">
                            <button onclick="closeResult()" data-i18n="cancel">Abbrechen</button>
                            <button onclick="openSupport()" data-i18n="support">Support</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- LIVE CHAT MODAL (IN SETTINGS INTEGRIERT) -->
    <div class="settings-backdrop" id="chat-modal" onclick="checkCloseChat(event)">
        <div class="settings-panel" style="padding:0; display:flex; flex-direction:column; height:75vh;" onclick="event.stopPropagation()">
            <div class="settings-header" style="padding: 15px; margin: 0; background: rgba(0,0,0,0.4); border-top-left-radius: 18px; border-top-right-radius: 18px;">
                <div class="settings-title" style="color: var(--primary-color);">🌍 Global Live-Chat</div>
                <button class="close-settings" onclick="toggleChat(false)">✕</button>
            </div>
            <div id="chat-messages" class="chat-messages">
                <!-- Nachrichten -->
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Nachricht..." onkeypress="if(event.key === 'Enter') sendChatMessage()">
                <button onclick="sendChatMessage()">➤</button>
            </div>
        </div>
    </div>

    <!-- SUPPORT MENÜ -->
    <div class="settings-backdrop" id="support-modal" onclick="checkCloseSupport(event)">
        <div class="settings-panel" onclick="event.stopPropagation()">
            <div class="settings-header">
                <div class="settings-title" data-i18n="support_btn">💬 Support kontaktieren</div>
                <button class="close-settings" onclick="toggleSupport(false)">✕</button>
            </div>
            <div style="text-align:center; font-size:0.85rem; margin-bottom:20px;">Wo möchtest du uns kontaktieren?</div>
            <button class="agree-btn" style="margin-bottom: 15px;" onclick="window.open('https://t.me/tayy1773', '_blank')">✈️ Telegram</button>
            <button class="agree-btn" onclick="window.open('https://wa.me/4995434449848', '_blank')">📞 WhatsApp</button>
        </div>
    </div>

    <!-- EINSTELLUNGEN -->
    <div class="settings-backdrop" id="settings-modal" onclick="checkCloseSettings(event)">
        <div class="settings-panel" onclick="event.stopPropagation()">
            <div class="settings-header">
                <div class="settings-title" onclick="handleSecretClick()" data-i18n="settings_title">⚙️ Einstellungen</div>
                <button class="close-settings" onclick="toggleSettings(false)">✕</button>
            </div>

            <!-- KATEGORIE 1: LAYOUT & FARBEN -->
            <div class="category-box">
                <div class="category-title">🎨 Layout & Farben</div>
                
                <div class="settings-row" style="margin-bottom: 15px;">
                    <span>Design-Stil</span>
                    <select id="theme-style-select" class="glass-select" onchange="changeThemeStyle(this.value)">
                        <option value="ios">iOS (Standard Glas)</option>
                        <option value="android">Android (Hacker Neon)</option>
                    </select>
                </div>

                <div class="settings-row" style="margin-bottom: 8px; gap: 5px;">
                    <button class="action-btn" onclick="saveCurrentLayout()">💾 Speichern</button>
                    <select id="layout-select" class="glass-select" style="flex: 1;">
                        <option value="">Layout wählen...</option>
                    </select>
                    <button class="action-btn" style="border-color: #ff4d4d; color: #ff4d4d; padding: 6px 10px;" onclick="deleteSelectedLayout()">🗑️</button>
                </div>
                <button class="action-btn" style="width: 100%; border-color: rgba(255,255,255,0.3); margin-bottom: 12px;" onclick="loadSelectedLayout()">📂 Gewähltes laden</button>
                <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                    <button class="action-btn" style="flex:1;" onclick="exportLayout()">📤 Exportieren</button>
                    <button class="action-btn" style="flex:1;" onclick="importLayout()">📥 Importieren</button>
                </div>

                <div class="settings-row">
                    <span>Neonfarbe</span><input type="color" id="neon-color-picker" value="#8a2be2" onchange="changeThemeColor(this.value)">
                </div>
                <div class="settings-row">
                    <span>Textfarbe</span><input type="color" id="text-color-picker" value="#ffffff" onchange="changeTextColor(this.value)">
                </div>
                <div class="settings-row" style="margin-bottom: 15px;">
                    <span>Unban-Farbe</span><input type="color" id="unban-color-picker" value="#32d74b" onchange="changeUnbanColor(this.value)">
                </div>

                <div style="font-size: 0.8rem; margin-bottom: 5px; opacity: 0.9;">Hintergrundbild / GIF:</div>
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onchange="handleImageUpload(this)">
                
                <div style="width: 100%; display: flex; justify-content: space-between; margin-top: 15px;">
                    <span>Hintergrund Helligkeit</span><span id="bg-opacity-val">40%</span>
                </div>
                <input type="range" id="bg-opacity-slider" min="10" max="100" value="40" style="width: 100%; accent-color: var(--primary-color);" oninput="updatePanelStyle()">
            </div>

            <!-- KATEGORIE 2: GLAS-EFFEKTE -->
            <div class="category-box">
                <div class="category-title">🎛️ Glas & Popups</div>
                
                <div style="width: 100%; display: flex; justify-content: space-between;">
                    <span>Menü Blur-Effekt</span><span id="blur-val">8px</span>
                </div>
                <input type="range" id="blur-slider" min="0" max="30" value="8" style="width: 100%; accent-color: var(--primary-color); margin-bottom: 10px;" oninput="updatePanelStyle()">
                
                <div style="width: 100%; display: flex; justify-content: space-between;">
                    <span>Menü Sichtbarkeit</span><span id="alpha-val">8%</span>
                </div>
                <input type="range" id="alpha-slider" min="0" max="100" value="8" style="width: 100%; accent-color: var(--primary-color); margin-bottom: 10px;" oninput="updatePanelStyle()">

                <div style="width: 100%; display: flex; justify-content: space-between;">
                    <span>Popup Blur (Ergebnis)</span><span id="popup-blur-val">12px</span>
                </div>
                <input type="range" id="popup-blur-slider" min="0" max="30" value="12" style="width: 100%; accent-color: var(--primary-color);" oninput="updatePanelStyle()">

                <button class="action-btn" style="width: 100%; margin-top: 15px; border-color: rgba(255,255,255,0.3);" onclick="resetPanelStyle()">🔄 Standard wiederherstellen</button>
            </div>

            <!-- KATEGORIE 3: TEXTE & LADER -->
            <div class="category-box">
                <div class="category-title">📝 Texte & Animationen</div>

                <div class="settings-row">
                    <span>Sprache</span>
                    <select id="lang-select" class="glass-select" onchange="changeLanguage(this.value)">
                        <option value="en">English</option><option value="de">Deutsch</option><option value="es">Español</option>
                        <option value="ru">Русский</option><option value="ar">العربية</option><option value="ja">日本語</option>
                        <option value="la">Latina</option><option value="it">Italiano</option>
                    </select>
                </div>

                <div class="settings-row"><span>Welcome-Text</span><button class="edit-text-btn" onclick="editWelcomeText()">✏️ Ändern</button></div>
                <div class="settings-row"><span>Bann-Text</span><button class="edit-text-btn" onclick="editBannedText()">✏️ Ändern</button></div>
                <div class="settings-row" style="margin-bottom: 15px;"><span>Unban-Text</span><button class="edit-text-btn" onclick="editUnbanText()">✏️ Ändern</button></div>

                <div style="font-size: 0.8rem; margin-bottom: 5px; opacity: 0.9;">Lade-Animation (Text & Bild):</div>
                <input type="text" id="custom-load-text" class="owner-input" placeholder="Text (z.B. Hacke Server...)" onchange="saveLoaderSettings()">
                <input type="file" accept="image/*" onchange="handleLoaderUpload(this)">
                
                <div class="settings-row" style="margin-top: 10px;">
                    <span>Bild Rotieren lassen?</span>
                    <input type="checkbox" id="loader-rotate" onchange="saveLoaderSettings()" style="width:20px; height:20px; accent-color: var(--primary-color);">
                </div>
                <div class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                    <span>Rotations-Speed</span>
                    <input type="range" id="loader-speed" min="1" max="10" value="5" style="width: 100%; accent-color: var(--primary-color);" oninput="saveLoaderSettings()">
                </div>
                <button class="action-btn" style="width: 100%; margin-top: 10px; border-color: #ff4d4d; color: #ff4d4d;" onclick="deleteLoaderImg()">🗑️ Ladebild entfernen</button>
            </div>

            <!-- KATEGORIE 4: COMMUNITY & TOOLS -->
            <div class="category-box">
                <div class="category-title">💬 Community & Tools</div>

                <button class="action-btn" style="width: 100%; margin-bottom: 15px; border-color: var(--primary-color); font-weight: bold;" onclick="toggleChat(true)">🌍 Globalen Live-Chat öffnen</button>

                <div style="font-size: 0.8rem; margin-bottom: 8px; font-weight: bold; color: var(--primary-color);">✉️ Unban E-Mail Generator</div>
                <div class="settings-row" style="margin-bottom: 8px;">
                    <select id="unban-template" class="glass-select" style="width: 100%;">
                        <option value="1">Standard (Unschuldig)</option>
                        <option value="2">Gehackt / Gestohlen</option>
                        <option value="3">Business Account</option>
                    </select>
                </div>
                <button class="action-btn" style="width: 100%; border-color: #32D74B; color: #32D74B; font-weight: bold; margin-bottom: 15px;" onclick="generateUnbanEmail()">📧 E-Mail App öffnen</button>
                
                <button class="agree-btn" style="padding: 10px;" onclick="openSupport()">📞 Support kontaktieren</button>
            </div>
        </div>
    </div>

    <!-- OWNER LOGIN MODAL -->
    <div id="owner-login-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 5000; align-items: center; justify-content: center;">
        <div style="background: var(--panel-bg); backdrop-filter: blur(12px); border-radius: 14px; padding: 20px; width: 280px; text-align: center; border: 1px solid var(--primary-color);">
            <h3 style="margin-bottom: 15px; color: var(--primary-color);">Admin Login</h3>
            <input type="text" id="admin-user" class="owner-input" placeholder="Benutzername">
            <input type="password" id="admin-pass" class="owner-input" placeholder="Passwort">
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="action-btn" style="flex:1" onclick="document.getElementById('owner-login-modal').style.display='none'">Abbrechen</button>
                <button class="action-btn" style="flex:1; border-color: var(--primary-color);" onclick="verifyOwner()">Login</button>
            </div>
        </div>
    </div>

    <!-- OWNER DASHBOARD MIT STATISTIKEN -->
    <div class="settings-backdrop" id="owner-panel" style="z-index: 5000;" onclick="if(event.target.id==='owner-panel') document.getElementById('owner-panel').classList.remove('active')">
        <div class="settings-panel" onclick="event.stopPropagation()">
            <div class="settings-header">
                <div class="settings-title" style="color: red;">👑 OWNER DASHBOARD</div>
                <button class="close-settings" onclick="document.getElementById('owner-panel').classList.remove('active')">✕</button>
            </div>
            
            <table class="owner-table">
                <tr><th>Gesamte Checks</th><td id="stat-total">Lade...</td></tr>
                <tr><th>Aktive Nutzer Heute</th><td id="stat-users">Lade...</td></tr>
                <tr><th>Letzte Nr.</th><td id="stat-lastnum">Lade...</td></tr>
                <tr><th>Letzter Status</th><td id="stat-laststat">Lade...</td></tr>
            </table>

            <!-- NEU: LIVE CHECK LOG -->
            <div style="font-size: 0.85rem; margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: var(--primary-color);">🕵️ Live Check-Log (Letzte 50)</div>
            <div style="max-height: 150px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; margin-bottom: 20px;">
                <table class="owner-table" style="margin-bottom: 0; border: none;">
                    <thead>
                        <tr>
                            <th style="position: sticky; top: 0; background: #111;">Zeit</th>
                            <th style="position: sticky; top: 0; background: #111;">IP</th>
                            <th style="position: sticky; top: 0; background: #111;">Nummer</th>
                            <th style="position: sticky; top: 0; background: #111;">Status</th>
                        </tr>
                    </thead>
                    <tbody id="stat-log-body">
                        <!-- Logs spawnen hier -->
                    </tbody>
                </table>
            </div>

            <button class="action-btn" style="width:100%; border-color:red; color:red; margin-bottom:20px;" onclick="resetStats()">🗑️ Statistik zurücksetzen</button>

            <p style="font-size: 0.85rem; margin-bottom: 10px; opacity: 0.8;">Neues Announcement erstellen:</p>
            <input type="text" id="new-ann-title" class="owner-input" placeholder="Titel (z.B. Wartungsarbeiten)">
            <textarea id="new-ann-content" class="owner-input" placeholder="Inhalt der Nachricht..." rows="3"></textarea>
            <div class="settings-row">
                <span>Dauer in Stunden:</span>
                <input type="number" id="new-ann-hours" class="owner-input" style="width: 80px; margin:0;" value="24">
            </div>
            <button class="agree-btn" style="margin-top: 15px; border-color: red; color: red;" onclick="postAnnouncement()">🚀 Senden</button>
        </div>
    </div>

    <script>
        const DEFAULT_BANNED_TEXT = "Banned by ViVa La Tayy";
        const DEFAULT_WELCOME_TEXT = "🔥 Welcome Back my Master 🔥";

        // --- SOCKET.IO CHAT LOGIK ---
        const socket = io(); 

        socket.on('chatHistory', (history) => {
            const chatBox = document.getElementById('chat-messages');
            chatBox.innerHTML = '';
            history.forEach(msg => appendMessageToChat(msg));
            chatBox.scrollTop = chatBox.scrollHeight;
        });

        socket.on('newMessage', (msg) => {
            appendMessageToChat(msg);
            const chatBox = document.getElementById('chat-messages');
            chatBox.scrollTop = chatBox.scrollHeight;
        });

        function toggleChat(open) {
            const m = document.getElementById('chat-modal');
            if(open) {
                toggleSettings(false);
                m.classList.add('active');
                const chatBox = document.getElementById('chat-messages');
                chatBox.scrollTop = chatBox.scrollHeight;
                
                if(!localStorage.getItem('snowi_chat_name')) {
                    const name = prompt("Wie möchtest du im Chat heißen?");
                    if(name) {
                        localStorage.setItem('snowi_chat_name', name.trim());
                    } else {
                        localStorage.setItem('snowi_chat_name', 'User' + Math.floor(Math.random()*1000));
                    }
                }
            } else {
                m.classList.remove('active');
            }
        }

        function checkCloseChat(e) {
            if (e.target.id === 'chat-modal') toggleChat(false);
        }

        function appendMessageToChat(msg) {
            const chatBox = document.getElementById('chat-messages');
            
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-msg ${msg.isAdmin ? 'chat-msg-admin' : ''}`;
            
            const nameSpan = document.createElement('div');
            nameSpan.className = `chat-name ${msg.isAdmin ? 'chat-name-admin' : ''}`;
            nameSpan.innerHTML = `<span>${msg.name}</span><span class="chat-time">${msg.time}</span>`;
            
            const textSpan = document.createElement('div');
            textSpan.innerText = msg.text;
            
            msgDiv.appendChild(nameSpan);
            msgDiv.appendChild(textSpan);
            chatBox.appendChild(msgDiv);
        }

        function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            if(!text) return;
            
            const adminPass = localStorage.getItem('snowi_admin_token'); 
            const name = localStorage.getItem('snowi_chat_name') || 'Gast';

            socket.emit('sendMessage', { name, text, adminPass });
            input.value = '';
        }

        // ==========================================
        // INDEXEDDB HELPER 
        // ==========================================
        function openDB() {
            return new Promise((resolve) => {
                if (!window.indexedDB) return resolve(null);
                const req = indexedDB.open('SnowiMediaDB', 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('media')) db.createObjectStore('media');
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
        }

        async function saveMedia(key, val) {
            try {
                const db = await openDB();
                if (!db) { try { localStorage.setItem(key, val); } catch(e){} return true; }
                return new Promise((resolve) => {
                    const tx = db.transaction('media', 'readwrite');
                    tx.objectStore('media').put(val, key);
                    tx.oncomplete = () => resolve(true);
                });
            } catch(e) { return false; }
        }

        async function loadMedia(key) {
            try {
                const db = await openDB();
                if (!db) return localStorage.getItem(key);
                return new Promise((resolve) => {
                    const tx = db.transaction('media', 'readonly');
                    const req = tx.objectStore('media').get(key);
                    req.onsuccess = () => resolve(req.result || localStorage.getItem(key));
                });
            } catch(e) { return localStorage.getItem(key); }
        }

        async function deleteMedia(key) {
            try {
                const db = await openDB();
                if (db) { const tx = db.transaction('media', 'readwrite'); tx.objectStore('media').delete(key); }
                localStorage.removeItem(key);
            } catch(e) {}
        }

        // ==========================================
        // SPRACH-WÖRTERBUCH
        // ==========================================
        const translations = {
            en: { agree_btn: "AGREE AND CONTINUE", autofill: "Autofill", api_loading: "Checking API...", your_phone: "Your phone number", is_unban: "is Unbanned", contact_support: "Please contact Support for assistance.", cancel: "Cancel", support: "Support", support_desk: "Support", settings_title: "⚙️ Settings", error_msg: "Error:" },
            de: { agree_btn: "ZUSTIMMEN UND WEITER", autofill: "Autofill", api_loading: "API wird abgefragt...", your_phone: "Deine Telefonnummer", is_unban: "ist Unban", contact_support: "Bitte kontaktiere Support für Hilfe.", cancel: "Abbrechen", support: "Support", support_desk: "サポート", settings_title: "⚙️ Einstellungen", error_msg: "Fehler:" },
            es: { agree_btn: "ACEPTAR Y CONTINUAR", autofill: "Autocompletar", api_loading: "Consultando API...", your_phone: "Tu número", is_unban: "no está baneado", contact_support: "Contacta a Soporte.", cancel: "Cancelar", support: "Soporte", support_desk: "Soporte", settings_title: "⚙️ Ajustes", error_msg: "Error:" },
            ru: { agree_btn: "ПРИНЯТЬ И ПРОДОЛЖИТЬ", autofill: "Автозаполнение", api_loading: "Проверка API...", your_phone: "Ваш номер", is_unban: "Разблокирован", contact_support: "Свяжитесь с поддержкой.", cancel: "Отмена", support: "Поддержка", support_desk: "Поддержка", settings_title: "⚙️ Настройки", error_msg: "Ошибка:" },
            ar: { agree_btn: "موافق ومتابعة", autofill: "ملء تلقائي", api_loading: "جاري الفحص...", your_phone: "رقم هاتفك", is_unban: "غير محظور", contact_support: "اتصل بالدعم.", cancel: "إلغاء", support: "الدعم", support_desk: "الدعم", settings_title: "⚙️ الإعدادات", error_msg: "خطأ:" },
            ja: { agree_btn: "同意して続行", autofill: "自動入力", api_loading: "APIを確認中...", your_phone: "電話番号", is_unban: "は制限解除されています", contact_support: "サポートにお問い合わせください。", cancel: "キャンセル", support: "サポート", support_desk: "サポート", settings_title: "⚙️ 設定", error_msg: "エラー:" },
            la: { agree_btn: "ACCIPERE ET CONTINUARE", autofill: "Autofill", api_loading: "API quaeritur...", your_phone: "Numerus tuus", is_unban: "non est interdictus", contact_support: "Mitte nuntium ad Support.", cancel: "Abolere", support: "Auxilium", support_desk: "Auxilium", settings_title: "⚙️ Optiones", error_msg: "Error:" },
            it: { agree_btn: "ACCETTA E CONTINUA", autofill: "Auto-compila", api_loading: "Controllo API...", your_phone: "Il tuo numero", is_unban: "è Sbloccato", contact_support: "Contatta il Supporto.", cancel: "Annulla", support: "Supporto", support_desk: "Supporto", settings_title: "⚙️ Impostazioni", error_msg: "Errore:" }
        };

        let currentLang = 'en';
        let secretClicks = 0;
        let secretTimer;

        document.addEventListener('DOMContentLoaded', async () => {
            changeLanguage(localStorage.getItem('snowi_lang') || 'de');
            
            document.getElementById('custom-extra-note').value = localStorage.getItem('snowi_extra_note') || '';

            await loadSavedSettings();
            updateLayoutDropdown();
            checkGlobalAnnouncements();
            applyLoaderSettings();
        });

        function saveExtraNote(val) {
            localStorage.setItem('snowi_extra_note', val);
        }

        function changeThemeStyle(styleName) {
            localStorage.setItem('snowi_theme_style', styleName);
            document.getElementById('theme-style-select').value = styleName;
            
            if (styleName === 'android') {
                document.body.classList.add('theme-android');
            } else {
                document.body.classList.remove('theme-android');
            }
        }

        function changeLanguage(lang) {
            currentLang = lang; 
            localStorage.setItem('snowi_lang', lang); 
            document.documentElement.lang = lang;
            document.body.style.direction = (lang === 'ar') ? 'rtl' : 'ltr';
            const t = translations[lang];
            document.querySelectorAll('[data-i18n]').forEach(el => { 
                if (t && t[el.getAttribute('data-i18n')]) el.innerText = t[el.getAttribute('data-i18n')]; 
            });
            document.getElementById('lang-select').value = lang;
            applyLoaderSettings(); 
        }

        function updatePanelStyle() {
            const blurVal = document.getElementById('blur-slider').value;
            const alphaVal = document.getElementById('alpha-slider').value; 
            const popupBlurVal = document.getElementById('popup-blur-slider').value;
            const bgOpVal = document.getElementById('bg-opacity-slider').value;
            
            document.documentElement.style.setProperty('--panel-blur', blurVal + 'px');
            document.documentElement.style.setProperty('--panel-bg', `rgba(20, 20, 20, ${alphaVal / 100})`);
            document.documentElement.style.setProperty('--popup-blur', popupBlurVal + 'px');
            document.documentElement.style.setProperty('--bg-opacity', bgOpVal / 100);
            
            document.getElementById('blur-val').innerText = blurVal + 'px';
            document.getElementById('alpha-val').innerText = alphaVal + '%';
            document.getElementById('popup-blur-val').innerText = popupBlurVal + 'px';
            document.getElementById('bg-opacity-val').innerText = bgOpVal + '%';
            
            localStorage.setItem('snowi_panel_blur', blurVal); 
            localStorage.setItem('snowi_panel_alpha', alphaVal);
            localStorage.setItem('snowi_popup_blur', popupBlurVal); 
            localStorage.setItem('snowi_bg_opacity', bgOpVal);
        }

        function resetPanelStyle() { 
            document.getElementById('blur-slider').value = 8; 
            document.getElementById('alpha-slider').value = 8; 
            document.getElementById('popup-blur-slider').value = 12;
            document.getElementById('bg-opacity-slider').value = 40;
            updatePanelStyle(); 
        }

        // --- OWNER BEREICH ---
        function handleSecretClick() {
            secretClicks++; clearTimeout(secretTimer);
            if (secretClicks >= 3) { secretClicks = 0; toggleSettings(false); document.getElementById('owner-login-modal').style.display = 'flex'; } 
            else { secretTimer = setTimeout(() => { secretClicks = 0; }, 800); }
        }

        async function verifyOwner() {
            const u = document.getElementById('admin-user').value; const p = document.getElementById('admin-pass').value;
            if (u === 'Tayy' && p === '0873@adv') {
                document.getElementById('owner-login-modal').style.display = 'none'; document.getElementById('owner-panel').classList.add('active'); document.getElementById('admin-pass').value = '';
                localStorage.setItem('snowi_admin_token', '0873@adv'); await loadStats(); 
            } else { alert("Falsche Anmeldedaten!"); }
        }

        async function loadStats() {
            try {
                const res = await fetch('/api/owner/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '0873@adv' }) });
                const data = await res.json();
                document.getElementById('stat-total').innerText = data.totalChecks; 
                document.getElementById('stat-users').innerText = data.activeUsersToday;
                document.getElementById('stat-lastnum').innerText = data.lastCheckedNum; 
                document.getElementById('stat-laststat').innerText = data.lastCheckedStatus;

                // NEU: Live Log Tabelle befüllen
                const logBody = document.getElementById('stat-log-body');
                logBody.innerHTML = '';
                if(data.recentChecks && data.recentChecks.length > 0) {
                    data.recentChecks.forEach(log => {
                        const tr = document.createElement('tr');
                        const statusColor = log.status === 'Banned' ? '#ff4d4d' : '#32d74b';
                        tr.innerHTML = `<td>${log.time}</td><td>${log.ip}</td><td>${log.number}</td><td style="color:${statusColor}; font-weight:bold;">${log.status}</td>`;
                        logBody.appendChild(tr);
                    });
                } else {
                    logBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Noch keine Checks</td></tr>';
                }

            } catch(e) {}
        }

        async function resetStats() {
            if(!confirm("Wirklich löschen?")) return;
            try { await fetch('/api/owner/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '0873@adv' }) }); loadStats(); alert("Statistik resettet."); } catch(e) {}
        }

        async function postAnnouncement() {
            const title = document.getElementById('new-ann-title').value; const content = document.getElementById('new-ann-content').value; const hours = document.getElementById('new-ann-hours').value;
            if(!title || !content) return alert("Bitte Titel und Inhalt eingeben!");
            try {
                const res = await fetch('/api/announcement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, hours, password: '0873@adv' }) });
                if((await res.json()).success) { alert("Announcement ist live!"); document.getElementById('owner-panel').classList.remove('active'); }
            } catch (err) { alert("Fehler beim Senden."); }
        }

        async function checkGlobalAnnouncements() {
            try {
                const data = await (await fetch('/api/announcement')).json();
                if(data && data.active && localStorage.getItem('snowi_seen_ann') !== data.id.toString()) {
                    document.getElementById('ann-title').innerText = data.title; document.getElementById('ann-content').innerText = data.content;
                    document.getElementById('announcement-modal').dataset.currentId = data.id; document.getElementById('announcement-modal').style.display = 'flex';
                }
            } catch (err) {}
        }

        function closeAnnouncement() {
            const id = document.getElementById('announcement-modal').dataset.currentId;
            if(id) localStorage.setItem('snowi_seen_ann', id); document.getElementById('announcement-modal').style.display = 'none';
        }

        // --- CUSTOM LOADER ---
        async function handleLoaderUpload(input) {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(e) { await saveMedia('snowi_loader_img', e.target.result); applyLoaderSettings(); alert("Ladebild gespeichert!"); };
            reader.readAsDataURL(file);
        }

        function saveLoaderSettings() {
            const txt = document.getElementById('custom-load-text').value; const rot = document.getElementById('loader-rotate').checked; const spd = document.getElementById('loader-speed').value;
            if(txt) localStorage.setItem('snowi_loader_text', txt); else localStorage.removeItem('snowi_loader_text');
            localStorage.setItem('snowi_loader_rotate', rot); localStorage.setItem('snowi_loader_speed', spd); applyLoaderSettings();
        }

        async function applyLoaderSettings() {
            const t = translations[currentLang]; const defaultText = t ? t.api_loading : "API wird abgefragt...";
            const txt = localStorage.getItem('snowi_loader_text') || defaultText; const rot = localStorage.getItem('snowi_loader_rotate') === 'true'; const spd = localStorage.getItem('snowi_loader_speed') || 5;
            document.getElementById('custom-load-text').value = localStorage.getItem('snowi_loader_text') || ''; document.getElementById('loader-rotate').checked = rot; document.getElementById('loader-speed').value = spd;
            document.getElementById('loading-text').innerText = txt; const imgEl = document.getElementById('loading-icon'); const savedImg = await loadMedia('snowi_loader_img');
            if(savedImg) { imgEl.src = savedImg; imgEl.style.display = 'block'; if(rot) { const dur = (11 - spd) * 0.2; imgEl.style.animation = `spin ${dur}s linear infinite`; } else { imgEl.style.animation = 'none'; } } else { imgEl.style.display = 'none'; }
        }

        async function deleteLoaderImg() { await deleteMedia('snowi_loader_img'); applyLoaderSettings(); alert("Ladebild entfernt!"); }

        // --- UNBAN E-MAIL GENERATOR ---
        function generateUnbanEmail() {
            const cc = document.getElementById('country-code').value.replace(/\D/g, '');
            const num = document.getElementById('phone-number').value.replace(/\D/g, '');
            
            let fullNumber = "";
            let resultBoxActive = document.getElementById('result-wrapper').style.display === 'block';

            if (resultBoxActive) {
                fullNumber = document.getElementById('desk-num').innerText;
            } else if (num.length > 3) {
                fullNumber = "+" + cc + " " + num;
            } else {
                fullNumber = prompt("Für welche Nummer soll die E-Mail sein?", "+" + cc + " ");
                if (!fullNumber || fullNumber.trim() === "") return;
            }

            const template = document.getElementById('unban-template').value;
            let subject = ""; let body = "";

            if (template === "1") {
                subject = "Urgent: Please reactivate my account - Number banned by mistake"; body = `Dear WhatsApp Support Team,\n\nMy WhatsApp account has been unexpectedly suspended. I am not aware of any violation of the Terms of Service. I only use my account for personal communication with my friends and family.\n\nI suspect this might be a system error or an automated false flag. Please review my account manually and reactivate my number as soon as possible, as I urgently need it for daily communication.\n\nMy phone number in full international format is: ${fullNumber}\n\nThank you for your fast help.\n\nBest regards,`;
            } else if (template === "2") {
                subject = "Account Compromised - Please restore my access"; body = `Dear WhatsApp Support,\n\nMy smartphone was recently stolen / compromised, and someone else gained access to my WhatsApp account. I believe they might have sent unauthorized messages using my number, which led to this ban.\n\nI have now recovered my SIM card and fully secured my device. Since I was not the one violating the Terms of Service, I kindly ask you to lift the suspension so I can securely use my account again.\n\nMy phone number is: ${fullNumber}\n\nThank you very much for your understanding and support.\n\nSincerely,`;
            } else if (template === "3") {
                subject = "Urgent Appeal: Business Account Suspended"; body = `Dear WhatsApp Support Team,\n\nMy WhatsApp Business account has been deactivated. We strictly adhere to all WhatsApp Business Policies and use the platform to provide customer support.\n\nThis suspension is causing significant disruption to our business operations and our customers are unable to reach us. If there was any unintentional violation, we apologize and will make sure to adjust our messaging strategy immediately.\n\nPlease review our case and lift the ban so we can continue serving our clients.\n\nRegistered Business Number: ${fullNumber}\n\nBest regards,`;
            }

            const targetEmail = template === "3" ? "smb_web@support.whatsapp.com" : "support@support.whatsapp.com";
            window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }

        // --- LAYOUT SHARE ---
        async function saveCurrentLayout() {
            const name = prompt("Name für das Layout:"); if(!name || name.trim() === "") return;
            const cleanName = name.trim(); const bgData = await loadMedia('snowi_bg_image') || '';
            const layoutData = {
                themeStyle: localStorage.getItem('snowi_theme_style') || 'ios',
                neon: localStorage.getItem('snowi_neon_color') || '#8a2be2', text: localStorage.getItem('snowi_text_color') || '#ffffff', unbanColor: localStorage.getItem('snowi_unban_color') || '#32d74b',
                blur: localStorage.getItem('snowi_panel_blur') || 8, alpha: localStorage.getItem('snowi_panel_alpha') || 8, 
                popupBlur: localStorage.getItem('snowi_popup_blur') || 12, bgOpacity: localStorage.getItem('snowi_bg_opacity') || 40, hasBg: !!bgData
            };
            if(bgData) { await saveMedia('snowi_layout_img_' + cleanName, bgData); } else { await deleteMedia('snowi_layout_img_' + cleanName); }
            let layouts = JSON.parse(localStorage.getItem('snowi_layouts') || '{}'); layouts[cleanName] = layoutData; localStorage.setItem('snowi_layouts', JSON.stringify(layouts)); 
            updateLayoutDropdown(); document.getElementById('layout-select').value = cleanName; alert(`✅ Layout gespeichert!`);
        }
        
        async function exportLayout() {
            const bgData = await loadMedia('snowi_bg_image') || '';
            const layoutData = {
                themeStyle: localStorage.getItem('snowi_theme_style') || 'ios',
                neon: localStorage.getItem('snowi_neon_color') || '#8a2be2', text: localStorage.getItem('snowi_text_color') || '#ffffff', unbanColor: localStorage.getItem('snowi_unban_color') || '#32d74b',
                blur: localStorage.getItem('snowi_panel_blur') || 8, alpha: localStorage.getItem('snowi_panel_alpha') || 8, 
                popupBlur: localStorage.getItem('snowi_popup_blur') || 12, bgOpacity: localStorage.getItem('snowi_bg_opacity') || 40, bgData: bgData
            };
            try { const res = await fetch('/api/layout/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ layoutData }) }); const data = await res.json(); if(data.success) { prompt("Hier ist der God-Mode Code für dieses Layout. Gib ihn an Freunde weiter!", data.code); } } catch(e) { alert("Server Fehler beim Exportieren."); }
        }

        async function importLayout() {
            const code = prompt("Gib den Layout-Code ein (z.B. TAYY-X9K2):"); if(!code) return;
            try {
                const res = await fetch('/api/layout/import/' + code.toUpperCase()); const data = await res.json();
                if(data.success && data.layoutData) {
                    const l = data.layoutData;
                    
                    changeThemeStyle(l.themeStyle || 'ios');
                    changeThemeColor(l.neon); document.getElementById('neon-color-picker').value = l.neon;
                    changeTextColor(l.text); document.getElementById('text-color-picker').value = l.text;
                    const unbanCol = l.unbanColor || '#32d74b'; changeUnbanColor(unbanCol); document.getElementById('unban-color-picker').value = unbanCol;
                    
                    document.getElementById('blur-slider').value = l.blur; document.getElementById('alpha-slider').value = l.alpha; 
                    document.getElementById('popup-blur-slider').value = l.popupBlur !== undefined ? l.popupBlur : 12; document.getElementById('bg-opacity-slider').value = l.bgOpacity !== undefined ? l.bgOpacity : 40;
                    updatePanelStyle();
                    
                    if(l.bgData) { await saveMedia('snowi_bg_image', l.bgData); document.getElementById('bg-img').src = l.bgData; document.getElementById('bg-img').style.display = 'block'; } else { await deleteMedia('snowi_bg_image'); document.getElementById('bg-img').style.display = 'none'; }
                    alert("✅ Layout erfolgreich importiert!");
                } else { alert("❌ Code nicht gefunden oder abgelaufen."); }
            } catch(e) { alert("Server Fehler beim Importieren."); }
        }

        function updateLayoutDropdown() {
            const select = document.getElementById('layout-select'); select.innerHTML = `<option value="">Layout wählen...</option>`;
            let layouts = JSON.parse(localStorage.getItem('snowi_layouts') || '{}'); for (let name in layouts) { const opt = document.createElement('option'); opt.value = name; opt.innerText = name; select.appendChild(opt); }
        }

        async function loadSelectedLayout() {
            const name = document.getElementById('layout-select').value; if(!name) return alert("Layout wählen!");
            const layout = JSON.parse(localStorage.getItem('snowi_layouts') || '{}')[name];
            if(layout) {
                changeThemeStyle(layout.themeStyle || 'ios');
                changeThemeColor(layout.neon); document.getElementById('neon-color-picker').value = layout.neon;
                changeTextColor(layout.text); document.getElementById('text-color-picker').value = layout.text;
                const unbanCol = layout.unbanColor || '#32d74b'; changeUnbanColor(unbanCol); document.getElementById('unban-color-picker').value = unbanCol;
                
                document.getElementById('blur-slider').value = layout.blur !== undefined ? layout.blur : 8; document.getElementById('alpha-slider').value = layout.alpha !== undefined ? layout.alpha : 8; 
                document.getElementById('popup-blur-slider').value = layout.popupBlur !== undefined ? layout.popupBlur : 12; document.getElementById('bg-opacity-slider').value = layout.bgOpacity !== undefined ? layout.bgOpacity : 40;
                updatePanelStyle();
                
                const bgData = await loadMedia('snowi_layout_img_' + name) || layout.bg || '';
                if(bgData) { await saveMedia('snowi_bg_image', bgData); document.getElementById('bg-img').src = bgData; document.getElementById('bg-img').style.display = 'block'; } else { await deleteMedia('snowi_bg_image'); document.getElementById('bg-img').style.display = 'none'; }
                alert(`✅ Geladen!`);
            }
        }

        async function deleteSelectedLayout() {
            const name = document.getElementById('layout-select').value; if(!name) return;
            if(confirm(`Wirklich löschen?`)) { let layouts = JSON.parse(localStorage.getItem('snowi_layouts') || '{}'); delete layouts[name]; localStorage.setItem('snowi_layouts', JSON.stringify(layouts)); await deleteMedia('snowi_layout_img_' + name); updateLayoutDropdown(); }
        }

        async function loadSavedSettings() {
            const savedTheme = localStorage.getItem('snowi_theme_style') || 'ios';
            changeThemeStyle(savedTheme);

            const savedNeon = localStorage.getItem('snowi_neon_color'); if (savedNeon) { document.getElementById('neon-color-picker').value = savedNeon; changeThemeColor(savedNeon); }
            const savedText = localStorage.getItem('snowi_text_color'); if (savedText) { document.getElementById('text-color-picker').value = savedText; changeTextColor(savedText); }
            const savedUnbanColor = localStorage.getItem('snowi_unban_color'); if (savedUnbanColor) { document.getElementById('unban-color-picker').value = savedUnbanColor; }
            
            document.getElementById('blur-slider').value = localStorage.getItem('snowi_panel_blur') || 8; 
            document.getElementById('alpha-slider').value = localStorage.getItem('snowi_panel_alpha') || 8; 
            document.getElementById('popup-blur-slider').value = localStorage.getItem('snowi_popup_blur') || 12;
            document.getElementById('bg-opacity-slider').value = localStorage.getItem('snowi_bg_opacity') || 40;
            updatePanelStyle();
            
            const savedBg = await loadMedia('snowi_bg_image'); if (savedBg) { const bgImg = document.getElementById('bg-img'); bgImg.src = savedBg; bgImg.style.display = 'block'; }
            document.getElementById('welcome-display').innerText = localStorage.getItem('snowi_welcome_text') || DEFAULT_WELCOME_TEXT;
        }

        function startApp() { const startScreen = document.getElementById('start-screen'); startScreen.classList.add('hidden'); setTimeout(() => { startScreen.style.display = 'none'; }, 500); }
        function toggleSettings(open) { const m = document.getElementById('settings-modal'); if(open) m.classList.add('active'); else m.classList.remove('active'); }
        function checkCloseSettings(e) { if (e.target.id === 'settings-modal') toggleSettings(false); }
        function toggleSupport(open) { const m = document.getElementById('support-modal'); if(open) { toggleSettings(false); m.classList.add('active'); } else m.classList.remove('active'); }
        function checkCloseSupport(e) { if (e.target.id === 'support-modal') toggleSupport(false); }
        function openSupport() { toggleSupport(true); }
        
        async function pasteFromClipboard() { 
            try { 
                const text = await navigator.clipboard.readText(); 
                if (text) { 
                    let raw = text.trim();
                    let clean = raw.replace(/\D/g, ''); 
                    
                    if (raw.startsWith('+') || raw.startsWith('00')) {
                        if (raw.startsWith('00')) clean = clean.substring(2);
                        
                        let possibleCC = clean.substring(0, 2);
                        if (clean.startsWith('1')) possibleCC = '1'; 
                        else if (clean.startsWith('35') || clean.startsWith('37') || clean.startsWith('38') || clean.startsWith('42') || clean.startsWith('50') || clean.startsWith('59') || clean.startsWith('67') || clean.startsWith('68') || clean.startsWith('69') || clean.startsWith('85') || clean.startsWith('88') || clean.startsWith('96') || clean.startsWith('97') || clean.startsWith('99')) possibleCC = clean.substring(0, 3);
                        
                        document.getElementById('country-code').value = possibleCC;
                        let rest = clean.substring(possibleCC.length);
                        if(rest.startsWith('0')) rest = rest.substring(1);
                        document.getElementById('phone-number').value = rest;
                    } else {
                        const cc = document.getElementById('country-code').value; 
                        if (cc && clean.startsWith(cc)) clean = clean.substring(cc.length); 
                        else if (clean.startsWith('0')) clean = clean.substring(1); 
                        document.getElementById('phone-number').value = clean; 
                    }
                } 
            } catch (err) {} 
        }

        function changeThemeColor(hex) { document.documentElement.style.setProperty('--primary-color', hex); localStorage.setItem('snowi_neon_color', hex); }
        function changeTextColor(hex) { document.documentElement.style.setProperty('--text-color', hex); localStorage.setItem('snowi_text_color', hex); }
        function changeUnbanColor(hex) { localStorage.setItem('snowi_unban_color', hex); }
        
        function editWelcomeText() { const neu = prompt("Welcome Text:", localStorage.getItem('snowi_welcome_text') || DEFAULT_WELCOME_TEXT); if (neu && neu.trim() !== "") { localStorage.setItem('snowi_welcome_text', neu.trim()); document.getElementById('welcome-display').innerText = neu.trim(); } }
        function editBannedText() { const neu = prompt("Banned Text:", (localStorage.getItem('snowi_banned_text') || DEFAULT_BANNED_TEXT).replace(/<br>/g, '\n')); if (neu && neu.trim() !== "") { localStorage.setItem('snowi_banned_text', neu.trim().replace(/\n/g, '<br>')); } }
        function editUnbanText() { const current = localStorage.getItem('snowi_unban_text') || (translations[currentLang] ? translations[currentLang].is_unban : "ist Unban"); const promptMsg = translations[currentLang] ? translations[currentLang].prompt_unban : "Neuen Text eingeben, wenn die Nummer frei ist:"; const neu = prompt(promptMsg, current.replace(/<br>/g, '\n')); if (neu && neu.trim() !== "") { localStorage.setItem('snowi_unban_text', neu.trim().replace(/\n/g, '<br>')); } }

        async function handleImageUpload(input) {
            const file = input.files[0]; if (!file) return;
            const bgImg = document.getElementById('bg-img'); bgImg.src = URL.createObjectURL(file); bgImg.style.display = 'block';
            if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
                const reader = new FileReader(); reader.onload = async function(e) { await saveMedia('snowi_bg_image', e.target.result); bgImg.src = e.target.result; }; reader.readAsDataURL(file);
            } else {
                const reader = new FileReader(); reader.onload = function(e) { const img = new Image(); img.onload = async function() { let finalData = e.target.result; if (file.size > 2.5 * 1024 * 1024) { const canvas = document.createElement('canvas'); const MAX_WIDTH = 1280; const MAX_HEIGHT = 1920; let width = img.width; let height = img.height; if (width > height && width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } else if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } canvas.width = width; canvas.height = height; canvas.getContext('2d').drawImage(img, 0, 0, width, height); finalData = canvas.toDataURL('image/jpeg', 0.85); } await saveMedia('snowi_bg_image', finalData); bgImg.src = finalData; }; img.src = e.target.result; }; reader.readAsDataURL(file);
            }
        }

        function formatPhoneNumber(cc, rawNum) { const clean = rawNum.replace(/\D/g, ''); if (cc === '49') { if (clean.startsWith('15678') || clean.startsWith('1563')) { return `+${cc} ${clean.slice(0, 5)} ${clean.slice(5)}`; } if (/^(15[1279]|16[023]|17[0-8])/.test(clean)) { return `+${cc} ${clean.slice(0, 3)} ${clean.slice(3)}`; } } return `+${cc} ${clean}`; }
        function closeResult() { document.getElementById('result-wrapper').style.display = 'none'; document.getElementById('desktop-view').classList.remove('active'); document.getElementById('mobile-view').classList.remove('active'); }

        async function checkNumber() {
            const t = translations[currentLang]; const cc = document.getElementById('country-code').value; const num = document.getElementById('phone-number').value; 
            if(num.trim() === "") return alert("Bitte Nummer eingeben");
            const formatted = formatPhoneNumber(cc, num); closeResult();
            document.getElementById('error-message').style.display = 'none'; document.getElementById('loading-wrapper').style.display = 'block';

            try {
                const response = await fetch('/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: "+" + cc + " " + num }) });
                const data = await response.json(); 
                
                let banned = false;
                if (data.banned === true || String(data.banned).toLowerCase() === 'true') banned = true;
                if (data.isBanned === true || String(data.isBanned).toLowerCase() === 'true') banned = true;
                if (data.data && (data.data.banned === true || String(data.data.banned).toLowerCase() === 'true')) banned = true;
                if (data.status && String(data.status).toLowerCase() === 'banned') banned = true;
                if (data.reason && String(data.reason).toLowerCase() === 'banned') banned = true;
                
                document.getElementById('loading-wrapper').style.display = 'none';
                
                document.getElementById('desk-num').innerText = formatted; const deskMsg = document.getElementById('desk-msg');
                document.getElementById('mob-num').innerText = formatted; const mobCustom = document.getElementById('mob-custom-text'); const mobSystem = document.getElementById('mob-system-text');
                const customBannedText = localStorage.getItem('snowi_banned_text') || DEFAULT_BANNED_TEXT;

                if (banned) {
                    deskMsg.innerHTML = customBannedText; deskMsg.style.color = "var(--text-color)";
                    mobCustom.innerHTML = customBannedText; mobCustom.style.color = "var(--text-color)"; mobSystem.style.display = 'block';
                } else {
                    const customUnbanText = localStorage.getItem('snowi_unban_text') || (t ? t.is_unban : "ist Unban");
                    const customUnbanColor = localStorage.getItem('snowi_unban_color') || "#32d74b";

                    deskMsg.innerHTML = customUnbanText; deskMsg.style.color = customUnbanColor;
                    mobCustom.innerHTML = customUnbanText; mobCustom.style.color = customUnbanColor; mobSystem.style.display = 'none';
                }
                
                document.getElementById('result-wrapper').style.display = 'block'; document.getElementById('desktop-view').classList.add('active'); document.getElementById('mobile-view').classList.add('active');
            } catch (err) {
                document.getElementById('loading-wrapper').style.display = 'none';
                const errDiv = document.getElementById('error-message'); errDiv.innerHTML = `<strong>Error</strong><br>API Offline`; errDiv.style.display = 'block';
            }
        }
    </script>
</body>
</html>
