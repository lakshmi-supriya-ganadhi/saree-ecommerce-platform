"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { Address, Order, User } from "@/lib/types";
import { updateProfileAction, addAddressAction } from "@/app/actions";
import { useWishlist } from "./wishlist-context";
import { useCart } from "./cart-context";
import { FabricSwatch } from "./fabric-swatch";
import { formatINR } from "@/lib/format";

type Tab = "profile" | "orders" | "wishlist" | "addresses";

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50";

const STATUS_COLORS: Record<Order["status"], string> = {
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export function AccountClient({
  user,
  orders,
  addresses,
}: {
  user: User;
  orders: Order[];
  addresses: Address[];
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const router = useRouter();

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "wishlist", label: "Wishlist" },
    { id: "addresses", label: "Saved Addresses" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        My Account
      </h1>

      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-rose-600 shadow-sm dark:bg-neutral-800 dark:text-rose-400"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab user={user} onSave={() => router.refresh()} />}
      {tab === "orders" && <OrdersTab orders={orders} />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "addresses" && (
        <AddressesTab addresses={addresses} onSave={() => router.refresh()} />
      )}
    </div>
  );
}

function ProfileTab({ user, onSave }: { user: User; onSave: () => void }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        Profile
      </h2>
      {!editing ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-neutral-500">Name</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Email</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.email}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-2 w-fit rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form
          action={formAction}
          onSubmit={() => {
            if (state.success) {
              setEditing(false);
              onSave();
            }
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">Name</span>
            <input name="name" defaultValue={user.name} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">
              Email (cannot change)
            </span>
            <input value={user.email} disabled className={`${inputClass} opacity-50`} />
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">Profile updated!</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-500">No orders yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">{order.id}</p>
              <p className="text-xs text-neutral-500">{order.date}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {order.items.map((item, i) => (
              <p key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.name} — {item.variant} × {item.quantity}
              </p>
            ))}
          </div>
          <p className="mt-3 text-right font-bold text-neutral-900 dark:text-neutral-50">
            {formatINR(order.total)}
          </p>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-500">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ saree, variant }) => (
        <div
          key={`${saree.id}-${variant.colorName}`}
          className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <FabricSwatch hex={variant.hex} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {saree.name}
            </p>
            <p className="text-xs text-neutral-500">
              {variant.colorName} · {saree.fabric}
            </p>
            <p className="text-sm font-bold text-rose-600">{formatINR(saree.price)}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => add(saree, variant)}
                className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
              >
                Add to cart
              </button>
              <button
                onClick={() => remove(saree.id)}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({
  addresses,
  onSave,
}: {
  addresses: Address[];
  onSave: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [state, formAction, pending] = useActionState(addAddressAction, {});

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !adding && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500">No saved addresses.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{addr.name}</p>
          <p className="text-neutral-600 dark:text-neutral-400">{addr.phone}</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {addr.street}, {addr.city} — {addr.pincode}
          </p>
          <p className="text-neutral-600 dark:text-neutral-400">{addr.state}</p>
        </div>
      ))}

      {adding && (
        <form
          action={formAction}
          onSubmit={() => {
            if (state.success) {
              setAdding(false);
              onSave();
            }
          }}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">New Address</h3>
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "street", label: "Street Address", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "pincode", label: "Pincode", type: "text" },
            { name: "state", label: "State", type: "text" },
          ].map((f) => (
            <label key={f.name} className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{f.label}</span>
              <input name={f.name} type={f.type} required className={inputClass} />
            </label>
          ))}
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">Address saved!</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          + Add New Address
        </button>
      )}
    </div>
  );
}
