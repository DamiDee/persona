// Settings page — account, appearance, subscription, danger zone

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  CreditCard,
  Bell,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { Button } from "../../components/ui/Button";
import { ThemeSegment, Toggle } from "../../components/ui/Toggle";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useToast } from "../../components/ui/Toast";

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-caption px-1">{title}</p>
      <GlassPanel intensity="md" rounded="lg" className="overflow-hidden divide-y divide-[var(--color-border)]">
        {children}
      </GlassPanel>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, onClick, accent, children }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 px-5 py-4 transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-[var(--color-accent-subtle)]",
        accent && "hover:bg-[var(--color-destructive-subtle)]"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div
        className={clsx(
          "w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0",
          accent
            ? "bg-[var(--color-destructive-subtle)] text-[var(--color-destructive)]"
            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
        )}
      >
        <Icon size={15} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx(
          "text-[15px] font-medium",
          accent ? "text-[var(--color-destructive)]" : "text-[var(--color-text-primary)]"
        )}>
          {label}
        </p>
        {value && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] truncate">{value}</p>
        )}
      </div>

      {children && <div className="flex-shrink-0">{children}</div>}
      {onClick && !children && (
        <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
      )}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { addToast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleLogout = async () => {
    await logout();
    addToast({ message: "You've been signed out.", type: "info" });
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    addToast({ message: "Account deleted (demo — not really!).", type: "info" });
    logout();
    navigate("/");
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <h1 className="text-[var(--color-text-primary)] text-3xl font-bold tracking-tight">
          Settings
        </h1>

        {/* Account */}
        <Section title="Account">
          <div className="flex items-center gap-4 px-5 py-5">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="text-[var(--color-text-primary)] font-semibold text-[17px]">
                {user?.name || "Guest User"}
              </p>
              <p className="text-[var(--color-text-tertiary)] text-[14px]">
                {user?.email || "—"}
              </p>
              <div className="mt-1.5">
                <Badge variant={user?.plan === "premium" ? "premium" : "free"}>
                  {user?.plan === "premium" ? "Premium" : "Free Plan"}
                </Badge>
              </div>
            </div>
          </div>
          <SettingRow
            icon={User}
            label="Edit Profile"
            value="Name, email, avatar"
            onClick={() => addToast({ message: "Profile editing coming soon!", type: "info" })}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow icon={Palette} label="Theme">
            <ThemeSegment value={theme} onChange={setTheme} />
          </SettingRow>
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          <SettingRow
            icon={CreditCard}
            label="Current Plan"
            value={user?.plan === "premium" ? "Persona Premium" : "Persona Free"}
          >
            {user?.plan !== "premium" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/app/premium")}
              >
                Upgrade
              </Button>
            )}
            {user?.plan === "premium" && (
              <div className="flex items-center gap-1.5 text-[var(--color-accent)] text-[13px] font-medium">
                <Check size={14} />
                Active
              </div>
            )}
          </SettingRow>
          {user?.plan === "premium" && (
            <SettingRow
              icon={CreditCard}
              label="Manage Subscription"
              value="Billing, cancellation"
              onClick={() => addToast({ message: "Subscription management coming soon!", type: "info" })}
            />
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow icon={Bell} label="Push Notifications">
            <Toggle
              id="notif-toggle"
              checked={notifEnabled}
              onChange={setNotifEnabled}
            />
          </SettingRow>
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow
            icon={Info}
            label="About Persona"
            value="Version 1.0.0 (Demo)"
            onClick={() => addToast({ message: "Persona v1.0.0 — Front-end demo", type: "info" })}
          />
        </Section>

        {/* Sign out */}
        <Section title="Account Actions">
          <SettingRow
            icon={LogOut}
            label="Sign Out"
            onClick={handleLogout}
          />
        </Section>

        {/* Danger zone */}
        <div className="space-y-3">
          <p className="text-caption px-1 text-[var(--color-destructive)]">Danger Zone</p>
          <GlassPanel intensity="md" rounded="lg" className="border border-[var(--color-destructive)]/20 overflow-hidden">
            <SettingRow
              icon={Trash2}
              label="Delete Account"
              value="Permanently delete your account and all data"
              onClick={() => setDeleteModalOpen(true)}
              accent
            />
          </GlassPanel>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
            This action cannot be undone. All your conversations and data will be permanently deleted.
          </p>
          <p className="text-[var(--color-text-secondary)] text-[14px]">
            (In this demo, no real data is deleted.)
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" fullWidth onClick={handleDeleteAccount}>
              <Trash2 size={15} />
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
