import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "./hooks/useAuth";
import { useBusinesses } from "./hooks/useBusinesses";
import { useUserBookings } from "./hooks/useUserBookings";
import { signOut } from "./api/auth";
import { LOGO_URL } from "./constants";

import AuthModal from "./components/AuthModal";
import BookingModal from "./components/BookingModal";
import BusinessSheet from "./components/BusinessSheet";
import DealSheet from "./components/DealSheet";

import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ProfilePage from "./pages/ProfilePage";
import BizDashboard from "./pages/BizDashboard";
import DealDetail from "./pages/DealDetail";
import InvitePage from "./pages/InvitePage";

const NAV_ITEMS = [
  { id: "home", label: "Главная", icon: "🏠" },
  { id: "map", label: "Карта", icon: "🗺️" },
];

export default function App() {
  const { user, setUser, loading } = useAuth();
  const [page, setPage] = useState("home");
  const [selBiz, setSelBiz] = useState(null);
  const [selDeal, setSelDeal] = useState(null);
  const [selDealBiz, setSelDealBiz] = useState(null);
  const [showBizSheet, setShowBizSheet] = useState(false);
  const [showDealSheet, setShowDealSheet] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [authContext, setAuthContext] = useState(null); // "deal" | null

  const { businesses } = useBusinesses();
  const { bookings } = useUserBookings(user?.id);
  const activeBookingsCount = bookings.filter(b => b.status === "active").length;

  const isBiz = user?.role === "owner" || user?.role === "staff";
  const isDetailPage = page === "deal";
  const profilePage = isBiz ? "dashboard" : "profile";

  const nav = [...NAV_ITEMS, { id: profilePage, label: isBiz ? "Кабинет" : "Профиль", icon: isBiz ? "📊" : "👤" }];

  const goToBiz = (b) => { setSelBiz(b); setShowBizSheet(true); };
  const goToDeal = (d, b) => { setShowBizSheet(false); setSelDeal(d); setSelDealBiz(b); setShowDealSheet(true); };
  const handleBack = () => { setPage("home"); };

  const handleBook = () => {
    if (!user) {
      setAuthContext("deal");
      setShowAuth(true);
      return;
    }
    setShowBooking(true);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // После логина — если был контекст брони, сразу открываем бронирование
    if (authContext === "deal" && selDeal) {
      setShowBooking(true);
    }
    setAuthContext(null);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setPage("home");
  };

  const inviteCode = new URLSearchParams(window.location.search).get("invite");
  if (inviteCode) return <InvitePage code={inviteCode} />;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FAFAF8" }}>
      <div style={{ textAlign: "center" }}>
        <img src={LOGO_URL} alt="TamakMap" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }} />
        <div style={{ fontSize: 13, color: "#9CA3AF" }}>Загрузка...</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#FAFAF8", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isDetailPage && (
              <button onClick={handleBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px 4px 0" }}>
                <ArrowLeft size={20} color="#374151" />
              </button>
            )}
            <img src={LOGO_URL} alt="TamakMap" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain" }} />
            <span style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>TamakMap</span>
          </div>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 700 }}>Привет, {user.name.split(" ")[0]}!</span>
              <div onClick={() => setPage(profilePage)} style={{ position: "relative", width: 32, height: 32, cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, background: "#F5920A", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 900 }}>
                  {user.name[0].toUpperCase()}
                </div>
                {activeBookingsCount > 0 && (
                  <div style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, background: "#16A34A", borderRadius: 8, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", padding: "0 3px" }}>
                    {activeBookingsCount}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>Привет!</span>
              <button onClick={() => setShowAuth(true)} style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "5px 12px", fontSize: 12, fontWeight: 800, color: "#92400E", cursor: "pointer" }}>Войти</button>
            </>
          )}
        </div>
      </div>

      {/* Pages */}
      <div style={{ minHeight: "calc(100vh - 112px)", overflowX: "hidden" }}>
        {page === "home"      && <HomePage      businesses={businesses} onBusiness={goToBiz} onDeal={goToDeal} />}
        {page === "map"       && <MapPage        businesses={businesses} onBusiness={goToBiz} />}
        {page === "profile"   && <ProfilePage    user={user} onLogout={handleLogout} onLogin={() => setShowAuth(true)} />}
        {page === "dashboard" && <BizDashboard
          user={user}
          onLogout={handleLogout}
          onBusinessAdded={(biz) => setUser(u => ({ ...u, businesses: [...(u.businesses || []), biz], business: u.business || biz }))}
          onBusinessUpdated={(upd) => setUser(u => ({
            ...u,
            businesses: (u.businesses || []).map(b => b.id === upd.id ? upd : b),
            business: u.business?.id === upd.id ? upd : u.business,
          }))}
        />}
        {page === "deal" && selDeal && <DealDetail deal={selDeal} biz={selDealBiz || selBiz} onBack={handleBack} onBook={handleBook} isLoggedIn={!!user} />}
      </div>

      {/* Bottom Nav */}
      {!isDetailPage && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #F0F0F0", display: "flex", zIndex: 100 }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => { if (!user && item.id === "profile") { setShowAuth(true); return; } setPage(item.id); }} style={{
              flex: 1, padding: "8px 4px 12px", border: "none", background: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: page === item.id ? "#16A34A" : "#9CA3AF" }}>{item.label}</span>
              {page === item.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#16A34A" }} />}
            </button>
          ))}
        </div>
      )}

      {/* Business bottom sheet */}
      {showBizSheet && selBiz && (
        <BusinessSheet
          biz={selBiz}
          onClose={() => setShowBizSheet(false)}
          onDeal={goToDeal}
        />
      )}

      {/* Deal bottom sheet */}
      {showDealSheet && selDeal && (
        <DealSheet
          deal={selDeal}
          biz={selDealBiz || selBiz}
          onClose={() => setShowDealSheet(false)}
          onBook={handleBook}
          isLoggedIn={!!user}
        />
      )}

      {/* Modals */}
      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthContext(null); }}
          onLogin={handleLogin}
          context={authContext}
        />
      )}
      {showBooking && selDeal && (
        <BookingModal
          deal={selDeal}
          biz={selDealBiz || selBiz}
          user={user}
          onClose={() => setShowBooking(false)}
          onBooked={(qty) => setSelDeal(d => d ? { ...d, remaining: d.remaining - qty } : d)}
        />
      )}
    </div>
  );
}