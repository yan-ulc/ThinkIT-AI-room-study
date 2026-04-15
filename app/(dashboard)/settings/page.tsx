export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto px-5 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-9">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Settings
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Manage your profile and preferences.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-4 border-b border-border px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-light bg-primary-muted text-sm font-semibold text-primary">
                AK
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Alex Kim</p>
                <p className="text-xs text-text-2">alex.kim@university.edu</p>
              </div>
              <button className="rounded-md border border-border px-3 py-1.5 text-sm text-text hover:bg-surface2">
                Edit photo
              </button>
            </div>

            <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-text-3">
                  Display name
                </span>
                <input
                  className="w-full rounded-md border border-border-strong bg-surface2 px-3 py-2 text-sm text-text outline-none"
                  defaultValue="Alex Kim"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-text-3">
                  Email
                </span>
                <input
                  className="w-full rounded-md border border-border-strong bg-surface2 px-3 py-2 text-sm text-text outline-none"
                  defaultValue="alex.kim@uni.edu"
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-text">Preferences</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {[
              {
                label: "Dark mode",
                sub: "Switch between light and dark",
                enabled: false,
              },
              {
                label: "AI suggestions",
                sub: "Show proactive AI insights",
                enabled: true,
              },
              {
                label: "Notifications",
                sub: "Desktop and email alerts",
                enabled: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-xs text-text-2">{item.sub}</p>
                </div>
                <span
                  className={`inline-flex h-5 w-9 rounded-full p-0.5 ${
                    item.enabled ? "bg-primary" : "bg-border-strong"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition-transform ${
                      item.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-text">Account</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-medium text-text">Sign out</p>
                <p className="text-xs text-text-2">Sign out of all sessions</p>
              </div>
              <button className="rounded-md border border-border px-3 py-1.5 text-sm text-text hover:bg-surface2">
                Sign out
              </button>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete account
                </p>
                <p className="text-xs text-text-2">
                  Permanently remove all data
                </p>
              </div>
              <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                Delete
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
