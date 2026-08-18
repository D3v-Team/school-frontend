import { Outlet } from "react-router-dom";
import { createContext } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

export const DataContext = createContext();

export default function MainLayout() {
    return (
        <DataContext.Provider>
            <Header />
            {/*
                --header-h is set dynamically by Header.jsx via JS.
                Fallback: 162px (38 topbar + 72 brand + 52 nav).
                On scroll the header collapses to 52px (nav only).
                We don't change padding on scroll intentionally —
                the page scrolls into view naturally.
            */}
            <div style={{ paddingTop: 'var(--header-h, 162px)' }}>
                <Outlet />
            </div>
            <Footer />
        </DataContext.Provider>
    );
}
