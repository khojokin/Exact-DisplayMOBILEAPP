import { useState, useRef } from "react";

const APP_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : "http://localhost:8080";

// ── Suggested data (mirrors community.tsx) ────────────────────────────────────
const SUGGESTED_COMMUNITIES = [
  { id: "sc1", name: "SDA Youth Network",       members: "3.2K", color: "#3B5BDB", initials: "YN" },
  { id: "sc2", name: "Prayer Warriors",          members: "1.8K", color: "#6B4F9B", initials: "PW" },
  { id: "sc3", name: "SDA Music Ministry",       members: "940",  color: "#8B3A8B", initials: "MM" },
  { id: "sc4", name: "Sabbath School Teachers",  members: "620",  color: "#B8860B", initials: "SS" },
  { id: "sc5", name: "Health & Wellness",        members: "1.1K", color: "#0E7B5B", initials: "HW" },
];

const SUGGESTED_PEOPLE = [
  { id: "sp1", name: "Pastor James Osei",  role: "Pastor",       color: "#3B5BDB" },
  { id: "sp2", name: "Elder Ruth Nakamura",role: "Elder",        color: "#B8860B" },
  { id: "sp3", name: "Abigail Owusu",      role: "Member",       color: "#8B3A8B" },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
function HomeIcon()    { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>; }
function ExploreIcon() { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>; }
function MessageIcon() { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function HeartIcon()   { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function PlusIcon()    { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function UserIcon()    { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function MenuIcon()    { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function BookIcon()    { return <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>; }
function CheckIcon()   { return <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>; }

const NAV_ITEMS = [
  { path: "/",          label: "Home",         icon: <HomeIcon /> },
  { path: "/community", label: "Explore",      icon: <ExploreIcon /> },
  { path: "/messages",  label: "Messages",     icon: <MessageIcon /> },
  { path: "/activity",  label: "Notifications",icon: <HeartIcon /> },
  { path: "/new-post",  label: "Create",       icon: <PlusIcon />, isCreate: true },
  { path: "/profile",   label: "Profile",      icon: <UserIcon /> },
];

// ── Sidebar nav item with hover tooltip ───────────────────────────────────────
function SidebarItem({ item, active, onClick }: { item: typeof NAV_ITEMS[0]; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 48, height: 48, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered || active ? "#1a1a1a" : "transparent",
          border: "none", cursor: "pointer",
          color: active ? "#fff" : "rgba(255,255,255,0.72)",
          transition: "background 0.15s",
          overflow: "visible",
        }}
      >
        {item.isCreate ? (
          <div style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #555", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlusIcon />
          </div>
        ) : item.icon}
      </button>
      {hovered && (
        <div style={{
          position: "absolute", left: 56, top: "50%", transform: "translateY(-50%)",
          background: "#262626", color: "#fff", fontSize: 14, fontWeight: 600,
          padding: "8px 14px", borderRadius: 8, whiteSpace: "nowrap",
          zIndex: 9999, pointerEvents: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {item.label}
        </div>
      )}
    </div>
  );
}

// ── Right panel ───────────────────────────────────────────────────────────────
function RightPanel({
  onCommunityClick,
  activeCommunityId,
}: {
  onCommunityClick: (id: string) => void;
  activeCommunityId: string | null;
}) {
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());

  function toggleJoin(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleFollow(id: string) {
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={{
      width: 320, flexShrink: 0,
      padding: "24px 16px",
      overflowY: "auto",
      display: "flex", flexDirection: "column", gap: 24,
    }}>

      {/* ── Suggested Communities ── */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Suggested communities</span>
          <button
            onClick={() => onCommunityClick("all")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7B5A", fontSize: 13, fontWeight: 600, padding: 0 }}
          >
            See all
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SUGGESTED_COMMUNITIES.map((comm) => {
            const isJoined = joined.has(comm.id);
            const isActive = activeCommunityId === comm.id;
            return (
              <button
                key={comm.id}
                onClick={() => onCommunityClick(comm.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 10px", borderRadius: 10,
                  background: isActive ? "#1a1a1a" : "transparent",
                  border: "none", cursor: "pointer",
                  width: "100%", textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#111"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 42, height: 42, borderRadius: 21, flexShrink: 0,
                  background: comm.color + "22",
                  border: `1.5px solid ${comm.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: comm.color, fontSize: 13, fontWeight: 800 }}>{comm.initials}</span>
                </div>

                {/* Name + members */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {comm.name}
                  </div>
                  <div style={{ color: "#636366", fontSize: 12, marginTop: 1 }}>{comm.members} members</div>
                </div>

                {/* Join / Joined button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleJoin(comm.id); }}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px", borderRadius: 20,
                    border: `1.5px solid ${isJoined ? "#3C3C3E" : comm.color}`,
                    background: isJoined ? "#2C2C2E" : "transparent",
                    color: isJoined ? "#636366" : comm.color,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  {isJoined && <CheckIcon />}
                  {isJoined ? "Joined" : "Join"}
                </button>
              </button>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "#1e1e1e" }} />

      {/* ── Suggested People ── */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>People to follow</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SUGGESTED_PEOPLE.map((person) => {
            const isFollowing = following.has(person.id);
            return (
              <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px" }}>
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: 21, flexShrink: 0,
                  background: person.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>
                    {person.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>

                {/* Name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {person.name}
                  </div>
                  <div style={{ color: "#636366", fontSize: 12, marginTop: 1 }}>{person.role}</div>
                </div>

                {/* Follow button */}
                <button
                  onClick={() => toggleFollow(person.id)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px", borderRadius: 20,
                    border: `1.5px solid ${isFollowing ? "#3C3C3E" : "#6B7B5A"}`,
                    background: isFollowing ? "#2C2C2E" : "transparent",
                    color: isFollowing ? "#636366" : "#6B7B5A",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  {isFollowing && <CheckIcon />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <div style={{ color: "#3C3C3E", fontSize: 11, lineHeight: 1.6 }}>
        SDA Community · Privacy · Terms · Help
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function PCLayout() {
  const [activePath, setActivePath]           = useState("/");
  const [moreHovered, setMoreHovered]         = useState(false);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigate(path: string) {
    setActivePath(path);
    // reload iframe to new path
  }

  function handleCommunityClick(id: string) {
    setActiveCommunityId(id);
    setActivePath("/community");
  }

  const iframeSrc = `${APP_URL}${activePath === "/" ? "" : activePath}`;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#000",
      display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* ── Narrow sidebar ─────────────────────────────────── */}
      <div style={{
        width: 72, flexShrink: 0,
        background: "#000",
        borderRight: "1px solid #1e1e1e",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 8, paddingBottom: 20, gap: 0,
        overflow: "visible", position: "relative", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "8px 0 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#6B7B5A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookIcon />
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, overflow: "visible" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === "/" ? activePath === "/" : activePath.startsWith(item.path);
            return (
              <SidebarItem
                key={item.path}
                item={item}
                active={isActive}
                onClick={() => navigate(item.path)}
              />
            );
          })}
        </div>

        {/* More */}
        <div style={{ position: "relative", overflow: "visible" }}>
          <button
            onMouseEnter={() => setMoreHovered(true)}
            onMouseLeave={() => setMoreHovered(false)}
            style={{
              width: 48, height: 48, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: moreHovered ? "#1a1a1a" : "transparent",
              border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.72)",
              transition: "background 0.15s", overflow: "visible",
            }}
          >
            <MenuIcon />
          </button>
          {moreHovered && (
            <div style={{
              position: "absolute", left: 56, top: "50%", transform: "translateY(-50%)",
              background: "#262626", color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "8px 14px", borderRadius: 8, whiteSpace: "nowrap",
              zIndex: 9999, pointerEvents: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}>
              More
            </div>
          )}
        </div>
      </div>

      {/* ── Center: app iframe ──────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", background: "#000", overflow: "hidden", borderRight: "1px solid #1e1e1e" }}>
        <div style={{ width: "100%", maxWidth: 630 }}>
          <iframe
            ref={iframeRef}
            key={iframeSrc}
            src={iframeSrc}
            style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
            title="SDA Community App"
          />
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <RightPanel
        onCommunityClick={handleCommunityClick}
        activeCommunityId={activeCommunityId}
      />
    </div>
  );
}
