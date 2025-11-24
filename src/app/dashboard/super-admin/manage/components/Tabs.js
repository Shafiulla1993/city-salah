// src/app/dashboard/super-admin/manage/components/Tabs.js

function Tabs({ active, onChange }) {
  return (
    <div className="tabs tabs-boxed">
      {Tabs.map((t) => (
        <a
          key={t}
          className={`tab ${active === t ? "tab-active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t}
        </a>
      ))}
    </div>
  );
}
