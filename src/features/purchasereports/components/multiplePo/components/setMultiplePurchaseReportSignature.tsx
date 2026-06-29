import React from "react";

interface SetMultiplePoSignatureSectionProps {
  title: string;
  user: any; // user object containing name, department, signature
  date?: string;
  API_BASE_URL: string;
  defaultOpacity?: number;
}

export function SetMultiplePoSignatureSection({
  title,
  user,
  date,
  API_BASE_URL,
  defaultOpacity = 50,
}: SetMultiplePoSignatureSectionProps) {
  const signatureSrc =
    user?.signature
      ? `${API_BASE_URL}/files/signatures/${user.signature.replace(
          /^\/?storage\/signatures\//,
          ""
        )}`
      : "assets/images/logo/signature.png";

  return (
    <div>
      <p className="text-sm tracking-tight font-bold uppercase">{title}</p>
      <div className="flex-grow text-start">
        <div className="flex justify-start items-start">
          {user ? (
            <img
              src={signatureSrc}
              alt={`${title} Signature`}
              className={`mt-4 h-20 w-48 opacity-${user.signature ? 100 : defaultOpacity}`}
              crossOrigin="anonymous"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <img
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              alt="Blank Signature"
              className="mt-4 w-20 opacity-0"
            />
          )}
        </div>

        <div className="flex flex-col w-48 uppercase text-center">
          <p className="text-md border-t m-1">{user?.name || "NOT AVAILABLE"}</p>
          <span className="text-sm text-gray-600">{user?.department || "-"}</span>
          <div className="text-xs tracking-tight font-bold uppercase">
            Date
            <span className="ml-2 font-medium">
              {date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
