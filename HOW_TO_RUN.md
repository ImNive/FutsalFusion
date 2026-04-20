# 🏃 How to Run FutsalFusion

This project consists of three main parts: **Backend**, **Turf Dashboard (Web)**, and **Futsal App (Mobile)**.

## 1. Prerequisites
*   **Node.js** installed on your computer.
*   **MongoDB** installed and running locally.
*   **Expo Go** app installed on your phone (to check the mobile app).

---

## 2. Start the Backend (API)
Open a terminal and run:
```bash
cd backend
npm install
node server.js
```
*The backend will run on `http://localhost:5000`.*

---

## 3. Start the Turf Dashboard (Web)
Open a **new** terminal and run:
```bash
cd turf-dashboard
npm install
npm start
```
*The dashboard will open in your browser at `http://localhost:3000`.*

---

## 4. Start the Futsal App (Mobile)
Open a **third** terminal and run:
```bash
cd futsal-app
npm install
npx expo start
```
### How to check the Mobile App:
1.  After running `npx expo start`, you will see a **QR Code** in your terminal.
2.  Open the **Expo Go** app on your iPhone (camera) or Android.
3.  Scan the QR code.
4.  The app will load on your phone!
    *   *Note: Ensure your phone and computer are on the same Wi-Fi network.*

---

## 🧠 Viva Preparation (Quick Guide)
*   **Tech Stack:** MERN (MongoDB, Express, React, Node.js) for Web + React Native (Expo) for Mobile.
*   **Authentication:** Used **JWT** (JSON Web Tokens) for secure login.
*   **Database:** MongoDB with **Mongoose** for modeling data like Turfs, Bookings, and Tournaments.
*   **Unique Feature:** 15-slot booking system and community-based player recruitment.
