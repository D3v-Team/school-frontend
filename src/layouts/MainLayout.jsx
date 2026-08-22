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
            */}
            <main style={{ paddingTop: 'var(--header-h, 162px)', minHeight: '70vh' }}>
                <Outlet />
            </main>
            <Footer />
        </DataContext.Provider>
    );
}
