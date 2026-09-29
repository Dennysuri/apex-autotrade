/**
 * Mwathe Trade Systems - Production Backend Engine
 * Client ID: 349eTg55tt6ZVaefjBIAH
 */

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DERIV_CLIENT_ID = '349eTg55tt6ZVaefjBIAH';

const SYSTEM_STATE = {
    accessToken: null,
    accountId: null,
    tradingWsConnected: false,
    publicWsConnected: false,
    activeAccountBalance: 0.00,
    consecutiveLossCount: 0
};

let tradingWs = null;
let publicWs = null;

// OAuth Token Exchange Route
app.post('/api/auth/token-exchange', async (req, res) => {
    const { code, codeVerifier, redirectUri } = req.body;
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', DERIV_CLIENT_ID);
        params.append('code', code);
        params.append('code_verifier', codeVerifier);
        params.append('redirect_uri', redirectUri);

        const response = await axios.post('https://auth.deriv.com/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        SYSTEM_STATE.accessToken = response.data.access_token;
        await initializeTradingPipelines(SYSTEM_STATE.accessToken);

        res.json({ success: true, tokenData: response.data });
    } catch (error) {
        console.error('Token exchange failure:', error.response?.data || error.message);
        res.status(400).json({ success: false, error: error.response?.data || error.message });
    }
});

async function initializeTradingPipelines(token) {
    try {
        const accountsRes = await axios.get('https://api.derivws.com/trading/v1/options/accounts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const accounts = accountsRes.data.data || accountsRes.data;
        if (!accounts || accounts.length === 0) return;

        SYSTEM_STATE.accountId = accounts[0].id || accounts[0].account_id;

        const otpRes = await axios.post(`https://api.derivws.com/trading/v1/options/accounts/${SYSTEM_STATE.accountId}/otp`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        connectAuthenticatedTradingWebSocket(otpRes.data.data.url);
        connectPublicMarketDataStream();
    } catch (err) {
        console.error('[Pipeline Initialization Error]:', err.response?.data || err.message);
    }
}

function connectAuthenticatedTradingWebSocket(otpUrl) {
    tradingWs = new WebSocket(otpUrl);
    tradingWs.on('open', () => {
        SYSTEM_STATE.tradingWsConnected = true;
        tradingWs.send(JSON.stringify({ balance: 1, subscribe: 1, req_id: 1 }));
    });
    tradingWs.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.msg_type === 'balance') {
            SYSTEM_STATE.activeAccountBalance = response.balance.balance;
        }
    });
}

function connectPublicMarketDataStream() {
    publicWs = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');
    publicWs.on('open', () => {
        SYSTEM_STATE.publicWsConnected = true;
        publicWs.send(JSON.stringify({ ticks: 'R_100', subscribe: 1, req_id: 10 }));
    });
    publicWs.on('close', () => setTimeout(connectPublicMarketDataStream, 3000));
}

// AutoD AI Vault Security Route
app.post('/api/ai/unlock', (req, res) => {
    const { password } = req.body;
    if (password === "Denny@1249") {
        res.json({ success: true, message: "AutoD AI vault unlocked successfully." });
    } else {
        res.status(401).json({ success: false, message: "Invalid vault password." });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Mwathe Engine] Running live on port ${PORT}`);
});
