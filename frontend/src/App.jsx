import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

/* =========================================================
   SUPPLIER DATA
========================================================= */

const suppliers = [
  {
    id: 1,
    name: "GreenGrow Supplies",
    location: "Salem",
    input: "Urea",
    quantity: 1200,
    price: 28,
    reliability: 94,
    delivery: 2,
    color: "from-green-400 to-emerald-600",
    emoji: "🌱",
  },
  {
    id: 2,
    name: "AgroMart",
    location: "Erode",
    input: "Urea",
    quantity: 600,
    price: 27,
    reliability: 88,
    delivery: 4,
    color: "from-yellow-400 to-orange-500",
    emoji: "🌾",
  },
  {
    id: 3,
    name: "FarmCare Traders",
    location: "Coimbatore",
    input: "DAP",
    quantity: 1000,
    price: 31,
    reliability: 91,
    delivery: 3,
    color: "from-teal-400 to-cyan-600",
    emoji: "🌿",
  },
];

const initialOrders = [
  {
    id: "ORD-001",
    input: "Urea",
    quantity: "500 kg",
    supplier: "GreenGrow Supplies",
    total: "₹14,000",
    status: "Delivered",
  },
  {
    id: "ORD-002",
    input: "DAP",
    quantity: "300 kg",
    supplier: "FarmCare Traders",
    total: "₹9,300",
    status: "Delayed",
  },
];

/* =========================================================
   INPUT INFORMATION
========================================================= */

const inputInfo = {
  Urea: {
    icon: "🌱",
    title: "Urea",
    description: "For healthy crop growth",
    gradient: "from-green-400 to-emerald-600",
  },

  DAP: {
    icon: "🌾",
    title: "DAP",
    description: "Helps roots grow strong",
    gradient: "from-yellow-400 to-orange-500",
  },

  Potash: {
    icon: "🍃",
    title: "Potash",
    description: "Makes crops stronger",
    gradient: "from-lime-400 to-green-600",
  },

  Seeds: {
    icon: "🌱",
    title: "Seeds",
    description: "For your next crop",
    gradient: "from-emerald-400 to-teal-600",
  },
};

/* =========================================================
   GLASS CARD
========================================================= */

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white/[0.08]
        backdrop-blur-2xl
        border
        border-white/[0.18]
        shadow-[0_20px_60px_rgba(0,0,0,0.18)]
        rounded-[28px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =========================================================
   FARM LOGO
========================================================= */

function FarmLogo({ small = false }) {
  return (
    <div
      className={`
        ${
          small
            ? "w-11 h-11 text-xl rounded-xl"
            : "w-16 h-16 text-3xl rounded-[20px]"
        }
        bg-gradient-to-br
        from-green-400
        via-emerald-500
        to-teal-600
        text-white
        flex
        items-center
        justify-center
        shadow-xl
        shadow-green-500/30
        border
        border-white/30
        relative
        overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />

      <span className="relative">🌱</span>
    </div>
  );
}

/* =========================================================
   BACKGROUND DOODLES
========================================================= */

function FarmDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

      <div className="absolute top-8 right-12 text-6xl opacity-[0.08]">
        ☀️
      </div>

      <div className="absolute top-[18%] left-[20%] text-5xl opacity-[0.06]">
        ☁️
      </div>

      <div className="absolute top-[35%] right-[5%] text-5xl opacity-[0.07]">
        🍃
      </div>

      <div className="absolute bottom-[8%] left-[4%] text-[130px] opacity-[0.05]">
        🌾
      </div>

      <div className="absolute bottom-[4%] right-[10%] text-[120px] opacity-[0.05]">
        🌾
      </div>

      <div className="absolute top-[55%] left-[7%] text-4xl opacity-[0.06]">
        🌱
      </div>

      <div className="absolute top-[70%] right-[25%] text-3xl opacity-[0.05]">
        ✿
      </div>

      <div className="absolute top-[25%] right-[35%] text-2xl opacity-[0.05]">
        ✦
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Delivered:
      "bg-green-100/80 text-green-700 border-green-200",
    Completed:
      "bg-green-100/80 text-green-700 border-green-200",
    Delayed:
      "bg-red-100/80 text-red-700 border-red-200",
    Replanned:
      "bg-yellow-100/80 text-yellow-700 border-yellow-200",
    Processing:
      "bg-blue-100/80 text-blue-700 border-blue-200",
    Pooled:
      "bg-purple-100/80 text-purple-700 border-purple-200",
  };

  const icons = {
    Delivered: "✓",
    Completed: "✓",
    Delayed: "!",
    Replanned: "↻",
    Processing: "•",
    Pooled: "●",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1.5
        rounded-full
        border
        text-xs
        font-bold
        ${styles[status] || "bg-white/10 text-white border-white/20"}
      `}
    >
      {icons[status] || "•"}
      {status}
    </span>
  );
}

/* =========================================================
   INPUT VISUAL
========================================================= */

function InputVisual({ name }) {
  const info = inputInfo[name] || {
    icon: "🌱",
    description: "Farm input",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-2xl shadow-sm">
        {info.icon}
      </div>

      <div>
        <p className="font-black text-slate-700">{name}</p>

        <p className="text-xs text-slate-400">
          {info.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">
          {title}
        </h1>

        <p className="text-sm text-slate-300 mt-1.5">
          {subtitle}
        </p>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  const location = useLocation();

  const menu = [
    {
      path: "/",
      label: "Home",
      sub: "My dashboard",
      icon: "🏠",
    },
    {
      path: "/requirements",
      label: "I Need",
      sub: "Add farm input",
      icon: "🌾",
    },
    {
      path: "/supplier",
      label: "Suppliers",
      sub: "Compare & choose",
      icon: "🏪",
    },
    {
      path: "/orders",
      label: "My Orders",
      sub: "Track delivery",
      icon: "🚚",
    },
    {
      path: "/agent",
      label: "Assistant",
      sub: "FarmBuy helper",
      icon: "🤝",
    },
    {
      path: "/bill",
      label: "My Bill",
      sub: "Bill & QR",
      icon: "🧾",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[300px] hidden md:flex flex-col z-30 p-5">

      <div
        className="
          h-full
          bg-slate-900/55
          backdrop-blur-3xl
          border
          border-white/[0.16]
          shadow-[0_25px_80px_rgba(0,0,0,0.25)]
          rounded-[36px]
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* ================= LOGO ================= */}

        <div className="px-7 pt-7 pb-6">

          <div className="flex items-center gap-4">

            <FarmLogo />

            <div>
              <h2 className="font-black text-white text-2xl">
                FarmBuy
              </h2>

              <p className="text-xs font-bold text-green-400 mt-1">
                🌱 Buy together. Save better.
              </p>
            </div>

          </div>

        </div>

        {/* ================= FARMER CARD ================= */}

        <div className="mx-5 mb-7">

          <div
            className="
              p-4
              rounded-[25px]
              bg-gradient-to-br
              from-white/[0.12]
              to-green-400/[0.08]
              border
              border-white/[0.15]
              shadow-inner
            "
          >

            <div className="flex items-center gap-3">

              <div className="
                w-12
                h-12
                rounded-2xl
                bg-gradient-to-br
                from-yellow-200
                to-green-200
                flex
                items-center
                justify-center
                text-2xl
                shadow-lg
              ">
                👨‍🌾
              </div>

              <div>

                <p className="text-[11px] text-slate-400">
                  Welcome back
                </p>

                <p className="font-black text-white text-base">
                  Farmer 01
                </p>

                <p className="text-[11px] text-green-400 font-bold mt-0.5">
                  📍 Salem
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================= MENU ================= */}

        <nav className="px-5 flex-1 overflow-y-auto">

          <p className="px-2 mb-4 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
            Your Farm
          </p>

          <div className="space-y-3">

            {menu.map((item) => {

              const active =
                location.pathname === item.path ||
                (item.path !== "/" &&
                  location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-[22px]
                    border
                    transition-all
                    duration-300
                    ${
                      active
                        ? `
                          bg-gradient-to-r
                          from-green-500
                          via-emerald-500
                          to-teal-500
                          border-green-300/30
                          text-white
                          shadow-[0_12px_30px_rgba(16,185,129,0.28)]
                          translate-x-1
                        `
                        : `
                          bg-white/[0.055]
                          border-white/[0.10]
                          text-slate-300
                          hover:bg-white/[0.10]
                          hover:border-white/[0.20]
                          hover:text-white
                          hover:translate-x-1
                          hover:shadow-lg
                        `
                    }
                  `}
                >

                  {/* Active indicator */}

                  {active && (
                    <span className="
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      w-1
                      h-10
                      bg-white
                      rounded-r-full
                    " />
                  )}

                  {/* Icon box */}

                  <span
                    className={`
                      flex
                     -shrink-0
                      w-11
                      h-11
                      rounded-[17px]
                      items-center
                      justify-center
                      text-xl
                      border
                      transition-all
                      ${
                        active
                          ? "bg-white/20 border-white/20 shadow-inner"
                          : "bg-white/[0.07] border-white/[0.10] group-hover:bg-green-400/10"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* Text */}

                  <div className="min-w-0">

                    <p className="text-sm font-black">
                      {item.label}
                    </p>

                    <p
                      className={`
                        text-[10px]
                        mt-0.5
                        ${
                          active
                            ? "text-green-100"
                            : "text-slate-500 group-hover:text-slate-400"
                        }
                      `}
                    >
                      {item.sub}
                    </p>

                  </div>

                  {/* Arrow */}

                  <span
                    className={`
                      ml-auto
                      text-xs
                      transition
                      ${
                        active
                          ? "text-white"
                          : "text-slate-600 group-hover:text-green-400"
                      }
                    `}
                  >
                    →
                  </span>

                </Link>
              );
            })}

          </div>

          {/* ================= TIP ================= */}

          <div
            className="
              mt-7
              p-4
              rounded-[24px]
              bg-gradient-to-br
              from-yellow-400/[0.12]
              to-green-400/[0.08]
              border
              border-yellow-300/[0.12]
            "
          >

            <div className="flex items-center gap-2">

              <span className="text-xl">
                💡
              </span>

              <p className="text-xs font-black text-yellow-300">
                Farm Tip
              </p>

            </div>

            <p className="text-[11px] text-slate-400 leading-5 mt-2">
              Keep your quantity and delivery date updated to get
              better supplier choices.
            </p>

            <div className="text-right text-2xl mt-2 opacity-40">
              🌱
            </div>

          </div>

        </nav>

        {/* ================= FOOTER ================= */}

        <div className="px-6 py-5 mt-3 border-t border-white/[0.08]">

          <p className="text-xs font-black text-slate-300">
            HACKSPRINT’26
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            FarmBuy · Problem AG-03
          </p>

        </div>

      </div>
    </aside>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ orders }) {

  const activeOrders = orders.filter(
    (o) =>
      o.status !== "Delivered" &&
      o.status !== "Completed"
  ).length;

  const completedOrders = orders.filter(
    (o) =>
      o.status === "Delivered" ||
      o.status === "Completed"
  ).length;

  const requirement =
    JSON.parse(
      localStorage.getItem("farmerRequirement")
    ) || null;

  return (
    <div>

      <PageHeader
        title="Welcome to FarmBuy 🌱"
        subtitle="Simple tools to help you buy farm inputs."
        action={
          <Link
            to="/requirements"
            className="
              bg-gradient-to-r
              from-green-500
              via-emerald-500
              to-teal-500
              hover:from-green-400
              hover:to-teal-400
              text-white
              px-5
              py-3
              rounded-2xl
              text-sm
              font-black
              shadow-xl
              shadow-green-500/20
              transition-all
              hover:-translate-y-1
            "
          >
            🌾 I Need Something
          </Link>
        }
      />

      {/* ================= HERO ================= */}

      <div className="
        relative
        overflow-hidden
        rounded-[36px]
        mb-7
        border
        border-white/[0.15]
        shadow-2xl
      ">

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-emerald-950
            via-green-900
            to-teal-900
          "
        />

        <div className="
          absolute
          inset-0
          bg-gradient-to-tr
          from-green-500/10
          via-transparent
          to-yellow-300/10
        " />

        <div className="
          absolute
          -right-20
          -top-20
          w-80
          h-80
          bg-green-400/20
          rounded-full
          blur-3xl
        " />

        <div className="
          absolute
          right-20
          bottom-[-100px]
          w-96
          h-96
          bg-yellow-300/10
          rounded-full
          blur-3xl
        " />

        <div className="absolute right-10 bottom-[-20px] text-[150px] opacity-[0.12]">
          🌾
        </div>

        <div className="absolute right-40 top-10 text-7xl opacity-[0.10]">
          🌱
        </div>

        <div className="relative z-10 p-8 md:p-11 text-white">

          <div className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-white/10
            border
            border-white/10
            backdrop-blur-md
            text-xs
            font-bold
          ">
            ✨ Smart farming made simple
          </div>

          <h2 className="text-3xl md:text-5xl font-black mt-5 leading-tight">
            Grow more.
            <br />
            Buy smarter. 🌾
          </h2>

          <p className="text-green-50/80 text-sm md:text-base mt-4 leading-7 max-w-xl">
            Tell FarmBuy what your farm needs. We help you compare
            suppliers, place orders and track delivery.
          </p>

          <Link
            to="/requirements"
            className="
              inline-flex
              items-center
              gap-2
              mt-7
              bg-white
              text-green-800
              px-6
              py-3.5
              rounded-2xl
              text-sm
              font-black
              hover:bg-green-50
              hover:-translate-y-1
              transition-all
              shadow-xl
            "
          >
            🌱 Start Buying →
          </Link>

        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

        {[
          [
            "MY REQUIREMENT",
            requirement ? "1" : "0",
            "items added",
            "🌾",
            "from-green-500/20 to-emerald-500/5",
          ],
          [
            "QUANTITY",
            requirement
              ? `${requirement.quantity} kg`
              : "0 kg",
            "current need",
            "⚖️",
            "from-yellow-500/20 to-orange-500/5",
          ],
          [
            "ACTIVE ORDERS",
            activeOrders,
            "processing / delayed",
            "🚚",
            "from-blue-500/20 to-indigo-500/5",
          ],
          [
            "DELIVERED",
            completedOrders,
            "completed orders",
            "✅",
            "from-teal-500/20 to-cyan-500/5",
          ],
        ].map(
          ([label, value, sub, icon, gradient]) => (

            <GlassCard
              key={label}
              className={`
                p-5
                bg-gradient-to-br
                ${gradient}
                hover:-translate-y-2
                transition-all
                duration-300
              `}
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-[10px] tracking-widest text-slate-400 font-black">
                    {label}
                  </p>

                  <h3 className="text-3xl font-black text-white mt-2">
                    {value}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {sub}
                  </p>

                </div>

                <div className="
                  w-14
                  h-14
                  bg-white/[0.08]
                  border
                  border-white/[0.12]
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-2xl
                  shadow-lg
                ">
                  {icon}
                </div>

              </div>

            </GlassCard>
          )
        )}

      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ORDERS */}

        <GlassCard className="lg:col-span-2 overflow-hidden">

          <div className="px-6 py-5 border-b border-white/[0.08] flex justify-between items-center">

            <div>
              <h3 className="font-black text-white">
                📦 Recent Orders
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Your latest purchases
              </p>
            </div>

            <Link
              to="/orders"
              className="text-xs font-black text-green-400 hover:text-green-300"
            >
              See all →
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="bg-white/[0.03] text-left text-xs text-slate-500">

                  <th className="px-6 py-3">
                    Order
                  </th>

                  <th className="px-6 py-3">
                    What
                  </th>

                  <th className="px-6 py-3">
                    Supplier
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders.slice(0, 5).map(
                  (order) => (

                    <tr
                      key={order.id}
                      className="
                        border-t
                        border-white/[0.06]
                        hover:bg-white/[0.04]
                        transition
                      "
                    >

                      <td className="px-6 py-4 font-black text-slate-300">
                        {order.id}
                      </td>

                      <td className="px-6 py-4">
                        <InputVisual
                          name={order.input}
                        />
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {order.supplier}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={order.status}
                        />
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </GlassCard>

        {/* ASSISTANT */}

        <div className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-gradient-to-br
          from-slate-950
          via-emerald-950
          to-green-950
          border
          border-white/[0.10]
          p-6
          text-white
          shadow-2xl
        ">

          <div className="
            absolute
            -right-16
            -top-16
            w-48
            h-48
            rounded-full
            bg-green-400/20
            blur-3xl
          " />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-gradient-to-br
                from-green-400
                to-teal-400
                flex
                items-center
                justify-center
                text-2xl
                shadow-lg
              ">
                🤝
              </div>

              <div>

                <h3 className="font-black">
                  FarmBuy Helper
                </h3>

                <p className="text-xs text-green-400">
                  ● Working for your farm
                </p>

              </div>

            </div>

            <p className="text-sm text-slate-400 mt-5 leading-6">
              I check suppliers, prices and delivery status to help
              with your procurement.
            </p>

            <div className="mt-6 space-y-3">

              {[
                ["🌾", "Collect your need"],
                ["🔎", "Compare suppliers"],
                ["🛒", "Place the order"],
                ["🚚", "Watch delivery"],
                ["🔄", "Find alternatives"],
              ].map(([icon, text]) => (

                <div
                  key={text}
                  className="flex items-center gap-3"
                >

                  <span className="
                    w-9
                    h-9
                    rounded-xl
                    bg-white/[0.08]
                    border
                    border-white/[0.08]
                    flex
                    items-center
                    justify-center
                  ">
                    {icon}
                  </span>

                  <span className="text-sm text-slate-400">
                    {text}
                  </span>

                </div>

              ))}

            </div>

            <Link
              to="/agent"
              className="inline-block mt-6 text-sm font-black text-green-400 hover:text-green-300"
            >
              See helper activity →
            </Link>

          </div>
        </div>

      </div>

      {/* ================= HOW IT WORKS ================= */}

      <GlassCard className="mt-7 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-black text-white">
              🌱 How FarmBuy works
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Simple steps from need to delivery
            </p>

          </div>

          <div className="hidden sm:block text-4xl opacity-50">
            👨‍🌾
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">

          {[
            ["🌾", "Tell us", "What do you need?"],
            ["👨‍🌾", "Group", "Farmers buy together"],
            ["🏪", "Compare", "Check suppliers"],
            ["🛒", "Buy", "Place your order"],
            ["🚚", "Track", "Watch delivery"],
          ].map(([icon, title, text]) => (

            <div
              key={title}
              className="
                group
                bg-white/[0.05]
                hover:bg-white/[0.09]
                border
                border-white/[0.08]
                rounded-3xl
                p-5
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >

              <div className="
                w-12
                h-12
                rounded-2xl
                bg-gradient-to-br
                from-green-400/20
                to-emerald-400/10
                border
                border-green-400/10
                flex
                items-center
                justify-center
                text-2xl
                group-hover:scale-110
                transition
              ">
                {icon}
              </div>

              <h4 className="font-black text-slate-200 mt-4">
                {title}
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                {text}
              </p>

            </div>

          ))}

        </div>

      </GlassCard>

    </div>
  );
}

/* =========================================================
   REQUIREMENTS
========================================================= */

function Requirements() {

  const [input, setInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("Salem");
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {

    const saved =
      localStorage.getItem("farmerRequirement");

    if (saved) {
      setSubmitted(JSON.parse(saved));
    }

  }, []);

  const submitRequirement = (e) => {

    e.preventDefault();

    if (!input || !quantity || !date || !location) {
      alert("Please fill all the fields.");
      return;
    }

    const requirement = {
      input,
      quantity,
      date,
      location,
      status: "Pooled",
    };

    localStorage.setItem(
      "farmerRequirement",
      JSON.stringify(requirement)
    );

    setSubmitted(requirement);
  };

  return (
    <div>

      <PageHeader
        title="🌾 What do you need?"
        subtitle="Tell us what your farm needs. We will do the comparing."
      />

      {/* INPUT CHOOSER */}

      <GlassCard className="p-6 mb-6">

        <div className="flex items-center gap-3">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-gradient-to-br
            from-green-400
            to-emerald-600
            flex
            items-center
            justify-center
            text-2xl
            shadow-lg
          ">
            🌱
          </div>

          <div>

            <h3 className="font-black text-white">
              Choose what you need
            </h3>

            <p className="text-xs text-slate-500">
              Tap one option
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

          {Object.keys(inputInfo).map((item) => {

            const info = inputInfo[item];
            const selected = input === item;

            return (
              <button
                type="button"
                key={item}
                onClick={() => setInput(item)}
                className={`
                  relative
                  text-left
                  p-5
                  rounded-3xl
                  border
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  ${
                    selected
                      ? "border-green-400/50 bg-green-400/10 shadow-xl shadow-green-500/10"
                      : "border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08]"
                  }
                `}
              >

                {selected && (
                  <div className="
                    absolute
                    top-3
                    right-3
                    w-7
                    h-7
                    rounded-full
                    bg-green-500
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-black
                  ">
                    ✓
                  </div>
                )}

                <div
                  className={`
                    w-16
                    h-16
                    rounded-2xl
                    bg-gradient-to-br
                    ${info.gradient}
                    flex
                    items-center
                    justify-center
                    text-3xl
                    shadow-lg
                  `}
                >
                  {info.icon}
                </div>

                <p className="font-black text-white mt-4">
                  {item}
                </p>

                <p className="text-[11px] text-slate-500 mt-1">
                  {info.description}
                </p>

              </button>
            );
          })}

        </div>

      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORM */}

        <GlassCard className="lg:col-span-2 p-6">

          <div className="flex items-center gap-3 mb-7">

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-gradient-to-br
              from-purple-400
              to-pink-500
              flex
              items-center
              justify-center
              text-2xl
              shadow-lg
            ">
              📝
            </div>

            <div>

              <h3 className="font-black text-white">
                A few simple details
              </h3>

              <p className="text-xs text-slate-500">
                Don't worry, it's easy!
              </p>

            </div>

          </div>

          <form onSubmit={submitRequirement}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-black text-slate-300 mb-2">
                  ⚖️ How much do you need?
                </label>

                <div className="flex">

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    placeholder="Example: 500"
                    className="
                      w-full
                      bg-white/[0.07]
                      border
                      border-white/[0.10]
                      rounded-l-2xl
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      outline-none
                      focus:ring-2
                      focus:ring-green-400/30
                    "
                  />

                  <span className="
                    bg-green-500/10
                    border
                    border-green-400/10
                    rounded-r-2xl
                    px-4
                    flex
                    items-center
                    text-sm
                    font-black
                    text-green-400
                  ">
                    kg
                  </span>

                </div>

              </div>

              <div>

                <label className="block text-sm font-black text-slate-300 mb-2">
                  📅 When do you need it?
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="
                    w-full
                    bg-white/[0.07]
                    border
                    border-white/[0.10]
                    rounded-2xl
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                  "
                />

              </div>

              <div>

                <label className="block text-sm font-black text-slate-300 mb-2">
                  📍 Where should it come?
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Village / town"
                  className="
                    w-full
                    bg-white/[0.07]
                    border
                    border-white/[0.10]
                    rounded-2xl
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    outline-none
                  "
                />

              </div>

              <div>

                <label className="block text-sm font-black text-slate-300 mb-2">
                  🌱 Your selected input
                </label>

                <div className="
                  bg-white/[0.05]
                  border
                  border-white/[0.10]
                  rounded-2xl
                  px-4
                  py-3.5
                ">

                  {input ? (
                    <InputVisual name={input} />
                  ) : (
                    <p className="text-sm text-slate-500">
                      Choose an input above
                    </p>
                  )}

                </div>

              </div>

            </div>

            <button
              type="submit"
              className="
                w-full
                mt-7
                bg-gradient-to-r
                from-green-500
                via-emerald-500
                to-teal-500
                hover:from-green-400
                hover:to-teal-400
                text-white
                py-4
                rounded-2xl
                text-sm
                font-black
                shadow-xl
                shadow-green-500/20
                transition-all
                hover:-translate-y-1
              "
            >
              🌾 Submit My Requirement
            </button>

          </form>

        </GlassCard>

        {/* INFO */}

        <div className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-gradient-to-br
          from-yellow-500/10
          via-orange-500/5
          to-green-500/10
          backdrop-blur-xl
          border
          border-white/[0.10]
          p-6
        ">

          <div className="absolute -right-8 -bottom-5 text-8xl opacity-[0.08]">
            🌾
          </div>

          <div className="text-6xl">
            👨‍🌾
          </div>

          <h3 className="font-black text-white mt-5 text-xl">
            What happens next?
          </h3>

          <p className="text-sm text-slate-400 mt-2 leading-6">
            We keep the process simple for you.
          </p>

          <div className="mt-6 space-y-5">

            {[
              [
                "1",
                "We collect your need",
                "Your requirement is saved.",
              ],
              [
                "2",
                "We check suppliers",
                "Price, stock and delivery are compared.",
              ],
              [
                "3",
                "You choose",
                "Select a supplier and place the order.",
              ],
            ].map(([number, title, text]) => (

              <div
                key={number}
                className="flex gap-3"
              >

                <span className="
                  w-9
                  h-9
                  rounded-2xl
                  bg-green-400/10
                  border
                  border-green-400/10
                  flex
                  items-center
                  justify-center
                  text-sm
                  font-black
                  text-green-400
                ">
                  {number}
                </span>

                <div>

                  <p className="text-sm font-black text-slate-300">
                    {title}
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-5">
                    {text}
                  </p>

                </div>

              </div>

            ))}

          </div>

          <div className="mt-7 text-right text-4xl opacity-30">
            🌱 🍃
          </div>

        </div>

      </div>

      {submitted && (

        <GlassCard className="mt-6 p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="
                w-12
                h-12
                bg-gradient-to-br
                from-green-400
                to-emerald-600
                text-white
                rounded-2xl
                flex
                items-center
                justify-center
                text-xl
              ">
                ✓
              </div>

              <div>

                <p className="font-black text-green-400">
                  Requirement saved!
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {submitted.input} · {submitted.quantity} kg ·{" "}
                  {submitted.location}
                </p>

              </div>

            </div>

            <StatusBadge status="Pooled" />

          </div>

        </GlassCard>

      )}

    </div>
  );
}

/* =========================================================
   SUPPLIER PAGE
========================================================= */

function Supplier({ onCreateOrder }) {

  const [requirement, setRequirement] =
    useState(null);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [quantity, setQuantity] =
    useState("");

  useEffect(() => {

    const saved =
      localStorage.getItem("farmerRequirement");

    if (saved) {
      setRequirement(JSON.parse(saved));
    }

  }, []);

  const matchingSuppliers =
    suppliers.filter(
      (supplier) =>
        !requirement ||
        supplier.input === requirement.input
    );

  const createOrder = () => {

    if (!selectedSupplier || !quantity) {
      alert(
        "Select a supplier and enter quantity."
      );
      return;
    }

    const total =
      Number(quantity) *
        selectedSupplier.price +
      500;

    const order = {
      id: `ORD-${Date.now()}`,
      input: selectedSupplier.input,
      quantity: `${quantity} kg`,
      supplier: selectedSupplier.name,
      total: `₹${total.toLocaleString("en-IN")}`,
      status: "Processing",
    };

    onCreateOrder(order);

    localStorage.setItem(
      "agentEvent",
      JSON.stringify({
        type: "ACT",
        text: `Order ${order.id} placed with ${selectedSupplier.name}.`,
        time: new Date().toLocaleTimeString(),
      })
    );

    alert("Order created successfully!");
  };

  return (
    <div>

      <PageHeader
        title="🏪 Choose Your Supplier"
        subtitle="Compare prices, stock and delivery before buying."
      />

      {!requirement ? (

        <GlassCard className="p-10 text-center">

          <div className="text-7xl">
            🌾
          </div>

          <h3 className="font-black text-white text-xl mt-5">
            Tell us what you need first
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Add a farm requirement to see suppliers.
          </p>

          <Link
            to="/requirements"
            className="
              inline-block
              mt-6
              bg-gradient-to-r
              from-green-500
              to-teal-500
              text-white
              px-6
              py-3
              rounded-2xl
              text-sm
              font-black
              shadow-lg
            "
          >
            🌱 Add Requirement
          </Link>

        </GlassCard>

      ) : (

        <>

          <div className="
            relative
            overflow-hidden
            rounded-[32px]
            mb-6
            p-6
            text-white
            bg-gradient-to-br
            from-purple-900
            via-violet-800
            to-indigo-900
            border
            border-white/[0.10]
            shadow-xl
          ">

            <div className="absolute right-5 top-2 text-7xl opacity-[0.08]">
              🌾
            </div>

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="
                  w-16
                  h-16
                  bg-white/10
                  backdrop-blur
                  rounded-3xl
                  flex
                  items-center
                  justify-center
                  text-3xl
                ">
                  {inputInfo[requirement.input]?.icon || "🌱"}
                </div>

                <div>

                  <p className="text-purple-200 text-xs font-bold">
                    YOU NEED
                  </p>

                  <h2 className="text-2xl font-black">
                    {requirement.input}
                  </h2>

                  <p className="text-sm text-purple-200 mt-1">
                    {requirement.quantity} kg · Needed by{" "}
                    {requirement.date}
                  </p>

                </div>

              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3">

                <p className="text-xs text-purple-200">
                  Delivery location
                </p>

                <p className="font-black mt-1">
                  📍 {requirement.location}
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            <GlassCard className="p-5">

              <p className="text-[10px] tracking-widest text-slate-500 font-black">
                SUPPLIERS FOUND
              </p>

              <p className="text-3xl font-black text-white mt-2">
                {matchingSuppliers.length}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                available choices
              </p>

            </GlassCard>

            <GlassCard className="p-5">

              <p className="text-[10px] tracking-widest text-slate-500 font-black">
                LOWEST PRICE
              </p>

              <p className="text-3xl font-black text-green-400 mt-2">
                ₹
                {matchingSuppliers.length
                  ? Math.min(
                      ...matchingSuppliers.map(
                        (s) => s.price
                      )
                    )
                  : 0}
                /kg
              </p>

              <p className="text-xs text-slate-500 mt-1">
                lowest available
              </p>

            </GlassCard>

            <GlassCard className="p-5">

              <p className="text-[10px] tracking-widest text-slate-500 font-black">
                RELIABILITY
              </p>

              <p className="text-3xl font-black text-white mt-2">
                {matchingSuppliers.length
                  ? Math.round(
                      matchingSuppliers.reduce(
                        (sum, s) =>
                          sum + s.reliability,
                        0
                      ) /
                        matchingSuppliers.length
                    )
                  : 0}
                %
              </p>

              <p className="text-xs text-slate-500 mt-1">
                average reliability
              </p>

            </GlassCard>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {matchingSuppliers.map(
              (supplier) => {

                const selected =
                  selectedSupplier?.id ===
                  supplier.id;

                return (

                  <GlassCard
                    key={supplier.id}
                    className={`
                      overflow-hidden
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      ${
                        selected
                          ? "ring-2 ring-green-400"
                          : ""
                      }
                    `}
                  >

                    <div
                      className={`
                        h-24
                        bg-gradient-to-br
                        ${supplier.color}
                        relative
                        overflow-hidden
                      `}
                    >

                      <div className="absolute right-4 top-1 text-7xl opacity-20">
                        {supplier.emoji}
                      </div>

                    </div>

                    <div className="p-5">

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-black text-white">
                            {supplier.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            📍 {supplier.location}
                          </p>

                        </div>

                        {selected && (
                          <div className="
                            w-9
                            h-9
                            rounded-full
                            bg-green-500
                            text-white
                            flex
                            items-center
                            justify-center
                            font-black
                          ">
                            ✓
                          </div>
                        )}

                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        {[
                          ["PRICE", `₹${supplier.price}/kg`, "green"],
                          ["STOCK", `${supplier.quantity} kg`, "blue"],
                          ["DELIVERY", `${supplier.delivery} days`, "yellow"],
                          ["RELIABILITY", `${supplier.reliability}%`, "purple"],
                        ].map(
                          ([label, value, color]) => (

                            <div
                              key={label}
                              className={`bg-${color}-500/10 rounded-2xl p-3 border border-white/[0.05]`}
                            >

                              <p className="text-[9px] font-black text-slate-500">
                                {label}
                              </p>

                              <p className="font-black text-slate-200 mt-1">
                                {value}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                      <button
                        onClick={() =>
                          setSelectedSupplier(
                            supplier
                          )
                        }
                        className={`
                          w-full
                          mt-5
                          py-3
                          rounded-2xl
                          text-sm
                          font-black
                          transition
                          ${
                            selected
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                              : "bg-white/[0.06] border border-white/[0.10] text-slate-300 hover:bg-white/[0.10]"
                          }
                        `}
                      >
                        {selected
                          ? "✓ Supplier Selected"
                          : "Choose This Supplier"}
                      </button>

                    </div>

                  </GlassCard>

                );
              }
            )}

          </div>

          {selectedSupplier && (

            <GlassCard className="mt-7 p-6">

              <div className="flex flex-col md:flex-row md:items-center gap-5">

                <div className="flex items-center gap-3 flex-1">

                  <div className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-gradient-to-br
                    from-green-400
                    to-emerald-600
                    flex
                    items-center
                    justify-center
                    text-2xl
                    text-white
                  ">
                    🛒
                  </div>

                  <div>

                    <p className="text-[10px] text-green-400 font-black tracking-widest">
                      READY TO BUY
                    </p>

                    <p className="font-black text-white">
                      {selectedSupplier.name}
                    </p>

                  </div>

                </div>

                <div className="w-full md:w-44">

                  <label className="block text-xs font-black text-slate-400 mb-2">
                    How many kg?
                  </label>

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    placeholder="500"
                    className="
                      w-full
                      bg-white/[0.07]
                      border
                      border-white/[0.10]
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                    "
                  />

                </div>

                <button
                  onClick={createOrder}
                  className="
                    bg-gradient-to-r
                    from-green-500
                    to-teal-500
                    text-white
                    px-6
                    py-3
                    rounded-2xl
                    text-sm
                    font-black
                    shadow-xl
                  "
                >
                  🛒 Place My Order
                </button>

              </div>

            </GlassCard>

          )}

        </>

      )}

    </div>
  );
}

/* =========================================================
   ORDERS
========================================================= */

function Orders({ orders, setOrders }) {

  const [failedOrder, setFailedOrder] =
    useState(null);

  const [alternative, setAlternative] =
    useState(null);

  const simulateFailure = (order) => {

    setFailedOrder(order);
    setAlternative(null);

    localStorage.setItem(
      "agentEvent",
      JSON.stringify({
        type: "OBSERVE",
        text: `Delivery issue detected for ${order.id}.`,
        time: new Date().toLocaleTimeString(),
      })
    );
  };

  const findAlternative = () => {

    if (!failedOrder) return;

    const alternativeSupplier =
      suppliers.find(
        (supplier) =>
          supplier.input === failedOrder.input &&
          supplier.name !== failedOrder.supplier
      );

    if (!alternativeSupplier) {
      alert("No alternative supplier available.");
      return;
    }

    setAlternative(alternativeSupplier);

    localStorage.setItem(
      "agentEvent",
      JSON.stringify({
        type: "REPLAN",
        text: `Alternative supplier found: ${alternativeSupplier.name}.`,
        time: new Date().toLocaleTimeString(),
      })
    );
  };

  const replanOrder = () => {

    if (!failedOrder || !alternative) return;

    const updatedOrders =
      orders.map((order) =>
        order.id === failedOrder.id
          ? {
              ...order,
              supplier: alternative.name,
              status: "Replanned",
            }
          : order
      );

    setOrders(updatedOrders);

    localStorage.setItem(
      "farmBuyOrders",
      JSON.stringify(updatedOrders)
    );

    setFailedOrder(null);
    setAlternative(null);

    alert("Order successfully replanned.");
  };

  return (
    <div>

      <PageHeader
        title="🚚 My Orders"
        subtitle="See your purchases and delivery status."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">

        <GlassCard className="p-5">
          <p className="text-[10px] tracking-widest text-slate-500 font-black">
            TOTAL ORDERS
          </p>

          <p className="text-3xl font-black text-white mt-2">
            {orders.length}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            purchases
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-[10px] tracking-widest text-slate-500 font-black">
            DELIVERED
          </p>

          <p className="text-3xl font-black text-green-400 mt-2">
            {
              orders.filter(
                (o) =>
                  o.status === "Delivered" ||
                  o.status === "Completed"
              ).length
            }
          </p>

          <p className="text-xs text-slate-500 mt-1">
            successfully received
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-[10px] tracking-widest text-slate-500 font-black">
            NEED ATTENTION
          </p>

          <p className="text-3xl font-black text-red-400 mt-2">
            {
              orders.filter(
                (o) =>
                  o.status === "Delayed" ||
                  o.status === "Replanned"
              ).length
            }
          </p>

          <p className="text-xs text-slate-500 mt-1">
            check these orders
          </p>
        </GlassCard>

      </div>

      <div className="space-y-5">

        {orders.map((order) => (

          <GlassCard
            key={order.id}
            className="p-5 hover:-translate-y-1 transition-all duration-300"
          >

            <div className="flex flex-col lg:flex-row lg:items-center gap-5">

              <InputVisual name={order.input} />

              <div className="flex-1">

                <p className="text-[10px] text-slate-500 font-bold">
                  ORDER
                </p>

                <p className="font-black text-slate-300 mt-1">
                  {order.id}
                </p>

              </div>

              <div>

                <p className="text-[10px] text-slate-500 font-bold">
                  QUANTITY
                </p>

                <p className="font-black text-slate-300 mt-1">
                  {order.quantity}
                </p>

              </div>

              <div>

                <p className="text-[10px] text-slate-500 font-bold">
                  SUPPLIER
                </p>

                <p className="font-black text-slate-300 mt-1">
                  {order.supplier}
                </p>

              </div>

              <div>

                <p className="text-[10px] text-slate-500 font-bold">
                  TOTAL
                </p>

                <p className="font-black text-green-400 mt-1">
                  {order.total}
                </p>

              </div>

              <StatusBadge status={order.status} />

              {order.status === "Delayed" && (

                <button
                  onClick={() =>
                    simulateFailure(order)
                  }
                  className="
                    text-xs
                    font-black
                    text-red-400
                    bg-red-500/10
                    border
                    border-red-400/10
                    px-4
                    py-2.5
                    rounded-xl
                  "
                >
                  ⚠️ Check Problem
                </button>

              )}

            </div>

          </GlassCard>

        ))}

      </div>

      {failedOrder && (

        <div className="
          mt-7
          bg-red-500/10
          backdrop-blur-xl
          border
          border-red-400/20
          rounded-[30px]
          p-6
        ">

          <div className="flex items-start gap-4">

            <div className="
              w-14
              h-14
              bg-gradient-to-br
              from-red-400
              to-orange-500
              text-white
              rounded-2xl
              flex
              items-center
              justify-center
              text-2xl
            ">
              🚨
            </div>

            <div>

              <h3 className="font-black text-red-300 text-lg">
                Delivery problem found
              </h3>

              <p className="text-sm text-red-200/70 mt-1">
                Order {failedOrder.id} from{" "}
                {failedOrder.supplier} is delayed.
              </p>

              <button
                onClick={findAlternative}
                className="
                  mt-4
                  bg-gradient-to-r
                  from-red-500
                  to-orange-500
                  text-white
                  px-5
                  py-3
                  rounded-2xl
                  text-sm
                  font-black
                "
              >
                🔎 Find Another Supplier
              </button>

            </div>

          </div>

        </div>

      )}

      {alternative && (

        <div className="
          mt-5
          bg-yellow-400/10
          backdrop-blur-xl
          border
          border-yellow-300/20
          rounded-[30px]
          p-6
        ">

          <div className="flex items-start gap-4">

            <div className="
              w-14
              h-14
              bg-gradient-to-br
              from-yellow-400
              to-orange-500
              text-white
              rounded-2xl
              flex
              items-center
              justify-center
              text-2xl
            ">
              🔄
            </div>

            <div>

              <p className="text-xs text-yellow-300 uppercase tracking-wide font-black">
                Alternative found
              </p>

              <h3 className="font-black text-white text-lg mt-2">
                {alternative.name}
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                ₹{alternative.price}/kg ·{" "}
                {alternative.delivery} days ·{" "}
                {alternative.reliability}% reliability
              </p>

              <button
                onClick={replanOrder}
                className="
                  mt-4
                  bg-gradient-to-r
                  from-green-500
                  to-emerald-600
                  text-white
                  px-5
                  py-3
                  rounded-2xl
                  text-sm
                  font-black
                "
              >
                ✓ Use This Supplier
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   AGENT ACTIVITY
========================================================= */

function AgentActivity() {

  const [event, setEvent] =
    useState(null);

  const refreshEvent = () => {

    const saved =
      localStorage.getItem("agentEvent");

    if (saved) {
      setEvent(JSON.parse(saved));
    }
  };

  useEffect(() => {
    refreshEvent();
  }, []);

  const runAgent = () => {

    const newEvent = {
      type: "PLAN",
      text: "FarmBuy checked the current requirement and supplier options.",
      time: new Date().toLocaleTimeString(),
    };

    localStorage.setItem(
      "agentEvent",
      JSON.stringify(newEvent)
    );

    setEvent(newEvent);
  };

  const steps = [
    ["🌾", "PERCEIVE", "Collect farmer requirement."],
    ["🔎", "PLAN", "Compare supplier choices."],
    ["🛒", "ACT", "Create the procurement order."],
    ["🚚", "OBSERVE", "Check delivery progress."],
    ["💭", "REFLECT", "Check if the plan is working."],
    ["🔄", "REPLAN", "Find another supplier if needed."],
  ];

  return (
    <div>

      <PageHeader
        title="🤝 FarmBuy Assistant"
        subtitle="See how the smart procurement process works."
        action={
          <div className="flex gap-2">

            <button
              onClick={refreshEvent}
              className="
                bg-white/[0.07]
                border
                border-white/[0.10]
                text-slate-300
                px-4
                py-2.5
                rounded-2xl
                text-sm
                font-bold
              "
            >
              ↻ Refresh
            </button>

            <button
              onClick={runAgent}
              className="
                bg-gradient-to-r
                from-green-500
                to-teal-500
                text-white
                px-4
                py-2.5
                rounded-2xl
                text-sm
                font-black
                shadow-lg
              "
            >
              ▶ Run Assistant
            </button>

          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <GlassCard className="lg:col-span-2 p-6">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="font-black text-white">
                🌱 What is the assistant doing?
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Six simple steps
              </p>

            </div>

            <div className="text-4xl opacity-40">
              🤖🌾
            </div>

          </div>

          <div>

            {steps.map(
              ([icon, name, description], index) => (

                <div
                  key={name}
                  className="flex gap-4 py-4 border-b border-white/[0.06] last:border-0"
                >

                  <div className="flex flex-col items-center">

                    <span className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-green-400/10
                      border
                      border-green-400/10
                      flex
                      items-center
                      justify-center
                      text-xl
                    ">
                      {icon}
                    </span>

                    {index !== steps.length - 1 && (
                      <div className="w-px h-full bg-green-400/10 mt-2" />
                    )}

                  </div>

                  <div className="pt-1">

                    <p className="text-xs font-black text-green-400 tracking-wide">
                      {name}
                    </p>

                    <p className="text-sm font-bold text-slate-300 mt-1">
                      {description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </GlassCard>

        <div className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-gradient-to-br
          from-slate-950
          via-emerald-950
          to-teal-950
          border
          border-white/[0.10]
          p-6
          text-white
          shadow-2xl
        ">

          <div className="absolute right-[-50px] top-[-40px] text-[130px] opacity-[0.06]">
            🌱
          </div>

          <div className="relative">

            <div className="
              w-16
              h-16
              rounded-3xl
              bg-gradient-to-br
              from-green-400
              to-teal-400
              flex
              items-center
              justify-center
              text-3xl
              shadow-xl
            ">
              🤝
            </div>

            <p className="text-xs text-green-300 font-black uppercase tracking-widest mt-6">
              Latest activity
            </p>

            {event ? (
              <>
                <p className="text-2xl font-black mt-2">
                  {event.type}
                </p>

                <p className="text-sm text-slate-400 mt-3 leading-6">
                  {event.text}
                </p>

                <p className="text-xs text-green-300 mt-5">
                  🕒 {event.time}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 mt-3">
                No new activity yet.
              </p>
            )}

            <div className="mt-7 bg-white/[0.05] border border-white/[0.06] rounded-2xl p-4">

              <p className="text-xs text-slate-400 leading-5">
                FarmBuy watches your procurement process and can
                help find another supplier when a delivery has a
                problem.
              </p>

            </div>

            <div className="text-right text-4xl mt-6 opacity-30">
              🌾 🍃
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   BILL
========================================================= */

function Bill() {

  const [order, setOrder] =
    useState(null);

  useEffect(() => {

    const savedOrders =
      localStorage.getItem("farmBuyOrders");

    if (savedOrders) {

      const orders =
        JSON.parse(savedOrders);

      if (orders.length) {
        setOrder(orders[orders.length - 1]);
        return;
      }
    }

    setOrder(initialOrders[0]);

  }, []);

  if (!order) {

    return (
      <GlassCard className="p-8">
        Loading bill...
      </GlassCard>
    );
  }

  const quantityNumber =
    parseInt(
      order.quantity.replace(/\D/g, ""),
      10
    );

  const supplier =
    suppliers.find(
      (s) => s.name === order.supplier
    );

  const price =
    supplier?.price || 28;

  const subtotal =
    quantityNumber * price;

  const delivery = 500;
  const total = subtotal + delivery;

  const billId =
    `BILL-${order.id.replace("ORD-", "")}`;

  const networkBase =
    "http://10.34.90.31:5173";

  const verifyUrl =
    `${networkBase}/verify/${billId}` +
    `?supplier=${encodeURIComponent(order.supplier)}` +
    `&input=${encodeURIComponent(order.input)}` +
    `&quantity=${encodeURIComponent(order.quantity)}` +
    `&total=${encodeURIComponent(
      `₹${total.toLocaleString("en-IN")}`
    )}` +
    `&order=${encodeURIComponent(order.id)}`;

  return (
    <div>

      <PageHeader
        title="🧾 My Bill"
        subtitle="Your purchase bill and QR verification."
      />

      <GlassCard className="max-w-4xl overflow-hidden">

        <div className="
          relative
          overflow-hidden
          bg-gradient-to-br
          from-green-800
          via-emerald-700
          to-teal-700
          p-7
          text-white
        ">

          <div className="absolute right-5 bottom-[-25px] text-8xl opacity-10">
            🌾
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-5 relative">

            <div className="flex items-center gap-3">

              <FarmLogo small />

              <div>

                <h2 className="font-black text-xl">
                  FarmBuy
                </h2>

                <p className="text-xs text-green-100">
                  Farm input purchase bill
                </p>

              </div>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-xs text-green-100">
                Bill number
              </p>

              <p className="font-black">
                {billId}
              </p>

              <p className="text-xs text-green-100 mt-2">
                Order: {order.id}
              </p>

            </div>

          </div>

        </div>

        <div className="p-6">

          <div className="
            bg-white/[0.05]
            border
            border-white/[0.08]
            rounded-3xl
            p-5
            mb-6
          ">

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="
                  w-13
                  h-13
                  bg-gradient-to-br
                  from-green-400
                  to-emerald-600
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-2xl
                ">
                  🏪
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Supplier
                  </p>

                  <p className="font-black text-slate-300">
                    {order.supplier}
                  </p>

                </div>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge
                    status={order.status}
                  />
                </div>

              </div>

            </div>

          </div>

          <div className="
            bg-white/[0.04]
            border
            border-white/[0.08]
            rounded-3xl
            p-5
          ">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <InputVisual name={order.input} />

              <div>

                <p className="text-xs text-slate-500">
                  Quantity
                </p>

                <p className="font-black text-slate-300 mt-1">
                  {order.quantity}
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Rate
                </p>

                <p className="font-black text-slate-300 mt-1">
                  ₹{price}/kg
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Amount
                </p>

                <p className="font-black text-green-400 mt-1">
                  ₹{subtotal.toLocaleString("en-IN")}
                </p>

              </div>

            </div>

          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-7">

            <div className="
              bg-green-500/[0.06]
              border
              border-green-400/[0.10]
              rounded-[30px]
              p-6
              text-center
            ">

              <div className="text-3xl">
                📱
              </div>

              <h3 className="font-black text-white mt-2">
                Scan to verify
              </h3>

              <div className="mt-4 bg-white p-4 rounded-3xl inline-block shadow-xl">

                <QRCodeSVG
                  value={verifyUrl}
                  size={175}
                  level="M"
                />

              </div>

              <p className="text-xs text-slate-500 mt-3">
                Scan this QR with a phone camera.
              </p>

            </div>

            <div className="
              bg-white/[0.04]
              border
              border-white/[0.08]
              rounded-[30px]
              p-6
              h-fit
            ">

              <h3 className="font-black text-white">
                💰 Payment Summary
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Item amount
                  </span>

                  <span className="font-bold text-slate-300">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-bold text-slate-300">
                    ₹500
                  </span>

                </div>

                <div className="border-t border-white/[0.08] pt-4 flex justify-between">

                  <span className="font-black text-slate-300">
                    Total
                  </span>

                  <span className="text-xl font-black text-green-400">
                    ₹{total.toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </GlassCard>

    </div>
  );
}

/* =========================================================
   VERIFY BILL
========================================================= */

function VerifyBill() {

  const location = useLocation();

  const params =
    new URLSearchParams(
      location.search
    );

  const supplier = params.get("supplier");
  const input = params.get("input");
  const quantity = params.get("quantity");
  const total = params.get("total");
  const order = params.get("order");

  if (
    !supplier ||
    !input ||
    !quantity ||
    !total
  ) {

    return (
      <div className="
        min-h-screen
        bg-gradient-to-br
        from-slate-950
        via-green-950
        to-slate-900
        flex
        items-center
        justify-center
        p-5
      ">

        <GlassCard className="p-8 max-w-md w-full text-center">

          <FarmLogo />

          <div className="
            w-16
            h-16
            rounded-full
            bg-red-500/10
            border
            border-red-400/20
            text-red-400
            flex
            items-center
            justify-center
            mx-auto
            mt-6
            text-2xl
          ">
            !
          </div>

          <h1 className="text-xl font-black text-white mt-4">
            Bill Not Found
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            The QR verification information is missing.
          </p>

        </GlassCard>

      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-950
      via-green-950
      to-slate-900
      flex
      items-center
      justify-center
      p-5
    ">

      <FarmDoodles />

      <GlassCard className="p-7 max-w-md w-full relative z-10">

        <div className="text-center">

          <FarmLogo />

          <div className="
            w-16
            h-16
            rounded-full
            bg-green-500/15
            border
            border-green-400/20
            text-green-400
            flex
            items-center
            justify-center
            mx-auto
            mt-6
            text-3xl
          ">
            ✓
          </div>

          <h1 className="text-2xl font-black text-white mt-4">
            Bill Verified
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            This FarmBuy bill has been successfully verified.
          </p>

        </div>

        <div className="
          mt-7
          bg-white/[0.04]
          border
          border-white/[0.08]
          rounded-3xl
          p-5
          space-y-4
        ">

          {[
            ["Order", order],
            ["Supplier", supplier],
            ["Farm input", input],
            ["Quantity", quantity],
          ].map(([label, value]) => (

            <div
              key={label}
              className="flex justify-between border-b border-white/[0.07] pb-3"
            >

              <span className="text-sm text-slate-500">
                {label}
              </span>

              <span className="text-sm font-bold text-slate-300">
                {value}
              </span>

            </div>

          ))}

          <div className="flex justify-between pt-1">

            <span className="font-black text-slate-400">
              Total amount
            </span>

            <span className="text-lg font-black text-green-400">
              {total}
            </span>

          </div>

        </div>

        <div className="
          mt-6
          bg-green-500/[0.08]
          border
          border-green-400/[0.12]
          rounded-2xl
          p-4
          text-center
        ">

          <p className="text-sm font-bold text-green-400">
            ✓ Bill details match the QR information.
          </p>

        </div>

      </GlassCard>

    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [orders, setOrders] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "farmBuyOrders"
        );

      return saved
        ? JSON.parse(saved)
        : initialOrders;

    });

  const createOrder = (order) => {

    const updatedOrders = [
      ...orders,
      order,
    ];

    setOrders(updatedOrders);

    localStorage.setItem(
      "farmBuyOrders",
      JSON.stringify(updatedOrders)
    );
  };

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/verify/:billId"
          element={<VerifyBill />}
        />

        <Route
          path="*"
          element={

            <div
              className="
                min-h-screen
                text-slate-200
                relative
                overflow-x-hidden
                bg-gradient-to-br
                from-[#071b16]
                via-[#0b2520]
                to-[#101b20]
              "
            >

              {/* ================= DARK BACKGROUND ================= */}

              <div className="
                fixed
                inset-0
                pointer-events-none
                overflow-hidden
                z-0
              ">

                <div className="
                  absolute
                  -top-40
                  -left-40
                  w-[600px]
                  h-[600px]
                  rounded-full
                  bg-green-500/15
                  blur-[120px]
                " />

                <div className="
                  absolute
                  top-[15%]
                  right-[-200px]
                  w-[650px]
                  h-[650px]
                  rounded-full
                  bg-teal-500/10
                  blur-[130px]
                " />

                <div className="
                  absolute
                  bottom-[-250px]
                  left-[25%]
                  w-[700px]
                  h-[700px]
                  rounded-full
                  bg-yellow-500/10
                  blur-[140px]
                " />

                <div className="
                  absolute
                  top-[45%]
                  left-[35%]
                  w-[400px]
                  h-[400px]
                  rounded-full
                  bg-emerald-400/10
                  blur-[120px]
                " />

                <FarmDoodles />

              </div>

              {/* SIDEBAR */}

              <Sidebar />

              {/* MAIN */}

              <main className="md:ml-[300px] min-h-screen relative z-10">

                {/* TOP BAR */}

                <header className="
                  sticky
                  top-0
                  z-20
                  h-[80px]
                  bg-slate-950/45
                  backdrop-blur-2xl
                  border-b
                  border-white/[0.08]
                  flex
                  items-center
                  justify-between
                  px-5
                  md:px-8
                ">

                  <div className="flex items-center gap-3">

                    <div className="md:hidden">
                      <FarmLogo small />
                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        FarmBuy
                      </p>

                      <p className="text-sm font-black text-slate-300">
                        Farmer's procurement space
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="hidden sm:block text-right">

                      <p className="text-xs font-black text-slate-300">
                        Farmer 01
                      </p>

                      <p className="text-[11px] text-slate-500">
                        📍 Salem
                      </p>

                    </div>

                    <div className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-gradient-to-br
                      from-yellow-300
                      to-orange-400
                      flex
                      items-center
                      justify-center
                      text-xl
                      shadow-lg
                    ">
                      👨‍🌾
                    </div>

                  </div>

                </header>

                {/* PAGE CONTENT */}

                <div className="
                  relative
                  z-10
                  p-5
                  md:p-8
                  max-w-[1500px]
                  mx-auto
                ">

                  <Routes>

                    <Route
                      path="/"
                      element={
                        <Dashboard
                          orders={orders}
                        />
                      }
                    />

                    <Route
                      path="/requirements"
                      element={
                        <Requirements />
                      }
                    />

                    <Route
                      path="/supplier"
                      element={
                        <Supplier
                          onCreateOrder={createOrder}
                        />
                      }
                    />

                    <Route
                      path="/orders"
                      element={
                        <Orders
                          orders={orders}
                          setOrders={setOrders}
                        />
                      }
                    />

                    <Route
                      path="/agent"
                      element={
                        <AgentActivity />
                      }
                    />

                    <Route
                      path="/bill"
                      element={
                        <Bill />
                      }
                    />

                  </Routes>

                </div>

              </main>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;