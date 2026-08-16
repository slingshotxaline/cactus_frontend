"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useGetMeQuery } from "../../../features/auth/authApi";
import {
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "../../../features/user/userApi";
import { setCredentials } from "../../../features/auth/authSlice";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  street: "",
  city: "",
  district: "",
  postalCode: "",
  isDefault: false,
};

export default function ProfilePage() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const { data, isLoading } = useGetMeQuery();
  const dispatch = useDispatch();

  const [updateProfile, { isLoading: isSavingProfile }] =
    useUpdateProfileMutation();
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [profileForm, setProfileForm] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressError, setAddressError] = useState("");

  const user = data?.data?.user;

  if (isLoading)
    return <div className="max-w-2xl mx-auto px-4 py-16">Loading...</div>;
  if (!user)
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        Please log in to view your profile.
      </div>
    );

  const form = profileForm || { name: user.name, phone: user.phone || "" };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    try {
      const result = await updateProfile(form).unwrap();
      dispatch(setCredentials({ user: result.data.user, accessToken }));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err?.data?.message || "Could not update profile.");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError("");
    try {
      await addAddress(addressForm).unwrap();
      setAddressForm(emptyAddress);
      setShowAddressForm(false);
    } catch (err) {
      setAddressError(err?.data?.message || "Could not save address.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.email || (
            <>
              No email on file —{" "}
              <Link
                href="/set-password"
                className="text-brand-500 hover:underline"
              >
                add one
              </Link>{" "}
              to secure your account.
            </>
          )}
        </p>
      </div>

      <section className="border border-gray-100 rounded-xl p-4">
        <h2 className="font-medium mb-4">Personal Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setProfileForm({ ...form, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              value={form.phone}
              onChange={(e) =>
                setProfileForm({ ...form, phone: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          {profileError && (
            <p className="text-sm text-red-600">{profileError}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
            {profileSaved && (
              <span className="text-sm text-green-600">✓ Saved</span>
            )}
          </div>
        </form>
      </section>

      <section className="border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Saved Addresses</h2>
          <button
            onClick={() => setShowAddressForm((s) => !s)}
            className="text-sm text-brand-500 hover:underline"
          >
            {showAddressForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form
            onSubmit={handleAddressSubmit}
            className="space-y-3 mb-4 pb-4 border-b border-gray-100"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Label (e.g. Home, Office)"
                value={addressForm.label}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, label: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Full name"
                required
                value={addressForm.fullName}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, fullName: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone"
                required
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Street"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm col-span-2"
              />
              <input
                placeholder="City"
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="District"
                value={addressForm.district}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, district: e.target.value })
                }
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    isDefault: e.target.checked,
                  })
                }
              />
              Set as default address
            </label>
            {addressError && (
              <p className="text-sm text-red-600">{addressError}</p>
            )}
            <button
              type="submit"
              disabled={isAddingAddress}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isAddingAddress ? "Saving..." : "Save Address"}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {(user.addresses || []).map((addr) => (
            <div
              key={addr._id}
              className="flex items-start justify-between border rounded-lg p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {addr.label}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.fullName} · {addr.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {addr.street}, {addr.city} {addr.district}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                {!addr.isDefault && (
                  <button
                    onClick={() =>
                      updateAddress({ addressId: addr._id, isDefault: true })
                    }
                    className="text-brand-500 hover:underline"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => deleteAddress(addr._id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {(!user.addresses || user.addresses.length === 0) && (
            <p className="text-sm text-gray-400">No saved addresses yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
