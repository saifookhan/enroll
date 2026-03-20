"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import InternshipsClassClient from "../InternshipsClassClient";

export default function InternshipsClass1Page() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!user?.token) {
      setTitle("");
      return;
    }
    fetch("/api/user/data/internships-class-names", {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) =>
        setTitle(
          data && typeof data.class1 === "string" ? data.class1.trim() : ""
        )
      )
      .catch(() => setTitle(""));
  }, [user?.userId, user?.token]);

  return (
    <InternshipsClassClient
      dataKey="internships-class-1"
      titleKey="internshipsClass1"
      title={title || `${t("internships")} - ${t("class1")}`}
      descriptionKey="manageInternshipsClass1"
      emptyMessageKey="noInternshipsYetClass1"
    />
  );
}
