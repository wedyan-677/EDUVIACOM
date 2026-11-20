/* ==========================================================================
   EDUVIA — Local dashboard
   This is a browser-local preview dashboard. Production should use a server
   with authentication and a database. No credentials are stored here.
   ========================================================================== */

(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const KEYS = {
    requests: "eduvia_requests_v1",
    messages: "eduvia_messages_v1",
    services: "eduvia_services_v1",
    portfolio: "eduvia_portfolio_v1",
    settings: "eduvia_settings_v1"
  };

  const statuses = {
    new: { label: "جديد", className: "status-badge--new" },
    progress: { label: "قيد التنفيذ", className: "status-badge--progress" },
    done: { label: "مكتمل", className: "status-badge--done" },
    cancelled: { label: "ملغي", className: "status-badge--cancelled" }
  };

  const workCategories = {
    brochure: "مطويات",
    presentation: "عروض",
    project: "مشاريع",
    worksheet: "أوراق عمل",
    infographic: "إنفوجرافيك",
    report: "تقارير",
    activity: "أنشطة",
    summary: "تلخيص"
  };

  function getArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function setArray(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      window.EDUVIA?.toast("تعذر حفظ البيانات في المتصفح.");
      return false;
    }
  }

  function esc(value) {
    return window.EDUVIA?.escapeHtml(value) ?? String(value ?? "");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatPhoneForDisplay(value) {
    if (!value) return "—";
    if (value.startsWith("+966")) {
      return `${value.slice(0, 4)} ${value.slice(4, 6)} ${value.slice(6, 9)} ${value.slice(9)}`;
    }
    return value;
  }

  /* -----------------------------------------------------------------------
     Navigation
     ----------------------------------------------------------------------- */

  function initAdminNav() {
    const links = $$("[data-admin-view]");
    const views = $$("[data-admin-panel]");

    const activate = (name) => {
      links.forEach((link) => link.classList.toggle("is-active", link.dataset.adminView === name));
      views.forEach((view) => view.classList.toggle("is-active", view.dataset.adminPanel === name));
      const pageTitle = {
        overview: "نظرة عامة",
        requests: "إدارة الطلبات",
        messages: "الرسائل الواردة",
        content: "إدارة المحتوى",
        settings: "إعدادات التواصل"
      }[name] || "لوحة التحكم";
      $("#admin-page-title").textContent = pageTitle;
      window.history.replaceState(null, "", `#${name}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    links.forEach((link) => link.addEventListener("click", () => activate(link.dataset.adminView)));
    const initial = window.location.hash.replace("#", "");
    activate(links.some((link) => link.dataset.adminView === initial) ? initial : "overview");
  }

  /* -----------------------------------------------------------------------
     Stats and overview
     ----------------------------------------------------------------------- */

  function renderStats() {
    const requests = getArray(KEYS.requests);
    const messages = getArray(KEYS.messages);
    const newCount = requests.filter((request) => request.status === "new").length;
    const progressCount = requests.filter((request) => request.status === "progress").length;
    const doneCount = requests.filter((request) => request.status === "done").length;
    const unreadCount = messages.filter((message) => !message.read).length;

    $("#stat-total").textContent = requests.length;
    $("#stat-new").textContent = newCount;
    $("#stat-progress").textContent = progressCount;
    $("#stat-done").textContent = doneCount;
    $("#stat-unread").textContent = unreadCount;
    $("#stat-requests-note").textContent = requests.length ? `آخر طلب: ${formatDate(requests[0].createdAt)}` : "لا توجد طلبات بعد";
    $("#stat-messages-note").textContent = messages.length ? `${unreadCount} غير مقروءة` : "لا توجد رسائل بعد";
    $("#admin-header-note").textContent = `${requests.length} طلب · ${unreadCount} رسالة غير مقروءة`;
  }

  function renderRecentRequests() {
    const body = $("#recent-requests-body");
    const requests = getArray(KEYS.requests).slice(0, 5);
    if (!body) return;

    if (!requests.length) {
      body.innerHTML = `<tr><td colspan="5"><div class="admin-empty"><svg class="icon"><use href="#i-file"></use></svg>لا توجد طلبات حتى الآن. أرسل طلبًا من صفحة «اطلب خدمتك» لتظهر هنا.</div></td></tr>`;
      return;
    }

    body.innerHTML = requests
      .map((request) => {
        const status = statuses[request.status] || statuses.new;
        return `<tr>
          <td class="admin-table__name"><strong>${esc(request.name)}</strong><small>${esc(request.reference)}</small></td>
          <td>${esc(request.serviceLabel)}</td>
          <td>${formatDate(request.createdAt)}</td>
          <td><span class="status-badge ${status.className}">${status.label}</span></td>
          <td><button class="icon-btn" type="button" data-view-request="${esc(request.id)}" aria-label="عرض الطلب"><svg class="icon"><use href="#i-eye"></use></svg></button></td>
        </tr>`;
      })
      .join("");
  }

  function renderRecentMessages() {
    const container = $("#recent-messages");
    if (!container) return;
    const messages = getArray(KEYS.messages).slice(0, 3);

    if (!messages.length) {
      container.innerHTML = `<div class="admin-empty"><svg class="icon"><use href="#i-message"></use></svg>لا توجد رسائل بعد.</div>`;
      return;
    }

    container.innerHTML = messages
      .map(
        (message) => `<button class="admin-list-item" type="button" data-view-message="${esc(message.id)}" style="width:100%;text-align:start;background:transparent;cursor:pointer">
          <span class="admin-list-item__art"><svg class="icon"><use href="#i-message"></use></svg></span>
          <span class="admin-list-item__copy"><strong>${esc(message.subject)}</strong><small>${esc(message.name)} · ${formatDate(message.createdAt)}</small></span>
          ${message.read ? "" : '<span class="status-badge status-badge--new">جديدة</span>'}
        </button>`
      )
      .join("");
  }

  /* -----------------------------------------------------------------------
     Requests
     ----------------------------------------------------------------------- */

  function requestStatusOptions(current) {
    return Object.entries(statuses)
      .map(([value, status]) => `<option value="${value}" ${current === value ? "selected" : ""}>${status.label}</option>`)
      .join("");
  }

  function renderRequests() {
    const body = $("#requests-body");
    if (!body) return;
    const query = ($("#request-search")?.value || "").trim().toLowerCase();
    const filter = $("#request-status-filter")?.value || "all";
    let requests = getArray(KEYS.requests);

    if (filter !== "all") requests = requests.filter((request) => request.status === filter);
    if (query) {
      requests = requests.filter((request) =>
        [request.name, request.phone, request.reference, request.serviceLabel, request.stageLabel]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (!requests.length) {
      body.innerHTML = `<tr><td colspan="7"><div class="admin-empty"><svg class="icon"><use href="#i-file"></use></svg>لا توجد طلبات مطابقة للبحث.</div></td></tr>`;
      return;
    }

    body.innerHTML = requests
      .map(
        (request) => `<tr>
          <td class="admin-table__name"><strong>${esc(request.name)}</strong><small>${esc(request.reference)}</small></td>
          <td><span dir="ltr">${esc(formatPhoneForDisplay(request.phone))}</span></td>
          <td>${esc(request.stageLabel)}</td>
          <td>${esc(request.serviceLabel)}</td>
          <td>${formatDate(request.deadline)}</td>
          <td>
            <select class="admin-select" data-status-request="${esc(request.id)}" aria-label="تغيير حالة الطلب">
              ${requestStatusOptions(request.status)}
            </select>
          </td>
          <td><div class="admin-actions">
            <button class="icon-btn" type="button" data-view-request="${esc(request.id)}" aria-label="عرض تفاصيل الطلب"><svg class="icon"><use href="#i-eye"></use></svg></button>
            <button class="icon-btn icon-btn--danger" type="button" data-delete-request="${esc(request.id)}" aria-label="حذف الطلب"><svg class="icon"><use href="#i-trash"></use></svg></button>
          </div></td>
        </tr>`
      )
      .join("");
  }

  function findRequest(id) {
    return getArray(KEYS.requests).find((request) => request.id === id);
  }

  function openRequestModal(id) {
    const request = findRequest(id);
    if (!request) return;
    const modal = $("#admin-modal");
    const status = statuses[request.status] || statuses.new;
    $("#admin-modal-title").textContent = `طلب ${request.reference}`;
    $("#admin-modal-body").innerHTML = `
      <dl class="detail-list">
        <div><dt>العميل</dt><dd>${esc(request.name)}</dd></div>
        <div><dt>رقم التواصل</dt><dd class="ltr">${esc(formatPhoneForDisplay(request.phone))}</dd></div>
        <div><dt>البريد الإلكتروني</dt><dd class="ltr">${esc(request.email || "غير مذكور")}</dd></div>
        <div><dt>المرحلة</dt><dd>${esc(request.stageLabel)}</dd></div>
        <div><dt>الخدمة</dt><dd>${esc(request.serviceLabel)}</dd></div>
        <div><dt>موعد التسليم</dt><dd>${formatDate(request.deadline)}</dd></div>
        <div><dt>تاريخ الطلب</dt><dd>${formatDateTime(request.createdAt)}</dd></div>
        <div><dt>الحالة</dt><dd><span class="status-badge ${status.className}">${status.label}</span></dd></div>
        <div><dt>التفاصيل</dt><dd style="white-space:pre-wrap;line-height:1.9">${esc(request.details)}</dd></div>
      </dl>
      <div class="form-actions" style="margin-top:1rem">
        <label class="form-label" for="modal-status">تحديث الحالة</label>
        <select class="admin-select" id="modal-status">${requestStatusOptions(request.status)}</select>
      </div>`;
    $("#modal-status").addEventListener("change", (event) => {
      updateRequestStatus(request.id, event.target.value);
      closeAdminModal();
    });
    openAdminModal();
  }

  function updateRequestStatus(id, status) {
    const requests = getArray(KEYS.requests);
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    request.status = status;
    setArray(KEYS.requests, requests);
    renderAll();
    window.EDUVIA?.toast("تم تحديث حالة الطلب.");
  }

  function deleteRequest(id) {
    const request = findRequest(id);
    if (!request) return;
    if (!window.confirm(`حذف طلب ${request.reference}؟ لا يمكن التراجع.`)) return;
    setArray(KEYS.requests, getArray(KEYS.requests).filter((item) => item.id !== id));
    renderAll();
    window.EDUVIA?.toast("تم حذف الطلب.");
  }

  function exportRequests() {
    const requests = getArray(KEYS.requests);
    if (!requests.length) {
      window.EDUVIA?.toast("لا توجد طلبات للتصدير.");
      return;
    }
    const rows = [
      ["المرجع", "الاسم", "الجوال", "البريد", "المرحلة", "الخدمة", "التفاصيل", "موعد التسليم", "تاريخ الطلب", "الحالة"],
      ...requests.map((request) => [
        request.reference,
        request.name,
        request.phone,
        request.email,
        request.stageLabel,
        request.serviceLabel,
        request.details,
        request.deadline,
        request.createdAt,
        statuses[request.status]?.label || request.status
      ])
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eduvia-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    window.EDUVIA?.toast("تم تصدير الطلبات بصيغة CSV.");
  }

  /* -----------------------------------------------------------------------
     Messages
     ----------------------------------------------------------------------- */

  function renderMessages() {
    const body = $("#messages-list");
    if (!body) return;
    const messages = getArray(KEYS.messages);

    if (!messages.length) {
      body.innerHTML = `<div class="admin-empty"><svg class="icon"><use href="#i-message"></use></svg>لا توجد رسائل واردة حتى الآن.</div>`;
      return;
    }

    body.innerHTML = messages
      .map(
        (message) => `<div class="admin-list-item">
          <span class="admin-list-item__art"><svg class="icon"><use href="#i-message"></use></svg></span>
          <span class="admin-list-item__copy">
            <strong>${esc(message.subject)} ${message.read ? "" : '<span class="status-badge status-badge--new" style="margin-inline-start:.4rem">جديدة</span>'}</strong>
            <small>${esc(message.name)} · ${esc(message.email)} · ${formatDate(message.createdAt)}</small>
          </span>
          <div class="admin-actions">
            <button class="icon-btn" type="button" data-view-message="${esc(message.id)}" aria-label="عرض الرسالة"><svg class="icon"><use href="#i-eye"></use></svg></button>
            <button class="icon-btn icon-btn--danger" type="button" data-delete-message="${esc(message.id)}" aria-label="حذف الرسالة"><svg class="icon"><use href="#i-trash"></use></svg></button>
          </div>
        </div>`
      )
      .join("");
  }

  function openMessageModal(id) {
    const messages = getArray(KEYS.messages);
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    message.read = true;
    setArray(KEYS.messages, messages);
    renderAll();
    $("#admin-modal-title").textContent = message.subject;
    $("#admin-modal-body").innerHTML = `
      <dl class="detail-list">
        <div><dt>المرسل</dt><dd>${esc(message.name)}</dd></div>
        <div><dt>البريد</dt><dd class="ltr">${esc(message.email)}</dd></div>
        <div><dt>التاريخ</dt><dd>${formatDateTime(message.createdAt)}</dd></div>
        <div><dt>الرسالة</dt><dd style="white-space:pre-wrap;line-height:1.9">${esc(message.message)}</dd></div>
      </dl>
      <div class="form-actions" style="margin-top:1rem">
        <a class="btn btn--primary btn--sm" href="mailto:${encodeURIComponent(message.email)}">الرد بالبريد</a>
      </div>`;
    openAdminModal();
  }

  function deleteMessage(id) {
    if (!window.confirm("حذف هذه الرسالة؟")) return;
    setArray(KEYS.messages, getArray(KEYS.messages).filter((message) => message.id !== id));
    renderAll();
    window.EDUVIA?.toast("تم حذف الرسالة.");
  }

  /* -----------------------------------------------------------------------
     Content
     ----------------------------------------------------------------------- */

  function renderContentLists() {
    const services = getArray(KEYS.services);
    const works = getArray(KEYS.portfolio);
    const servicesList = $("#services-list");
    const worksList = $("#works-list");

    if (servicesList) {
      servicesList.innerHTML = services.length
        ? services
            .map(
              (service) => `<div class="admin-list-item">
                <span class="admin-list-item__art"><svg class="icon"><use href="#i-sparkle"></use></svg></span>
                <span class="admin-list-item__copy"><strong>${esc(service.title)}</strong><small>${service.category === "university" ? "خدمة جامعية" : "خدمة مدرسية"} · ${formatDate(service.createdAt)}</small></span>
                <button class="icon-btn icon-btn--danger" type="button" data-delete-service="${esc(service.id)}" aria-label="حذف الخدمة"><svg class="icon"><use href="#i-trash"></use></svg></button>
              </div>`
            )
            .join("")
        : '<div class="admin-empty">لا توجد خدمات مضافة. الخدمات الأساسية تظهر في الموقع بشكل ثابت.</div>';
    }

    if (worksList) {
      worksList.innerHTML = works.length
        ? works
            .map(
              (work) => `<div class="admin-list-item">
                <span class="admin-list-item__art"><svg class="icon"><use href="#i-grid"></use></svg></span>
                <span class="admin-list-item__copy"><strong>${esc(work.title)}</strong><small>${esc(work.categoryLabel || workCategories[work.category] || "عمل")} · ${formatDate(work.createdAt)}</small></span>
                <button class="icon-btn icon-btn--danger" type="button" data-delete-work="${esc(work.id)}" aria-label="حذف العمل"><svg class="icon"><use href="#i-trash"></use></svg></button>
              </div>`
            )
            .join("")
        : '<div class="admin-empty">لا توجد أعمال مضافة. أعمال المعرض الأساسية تظهر في الموقع بشكل ثابت.</div>';
    }
  }

  function initContentForms() {
    const serviceForm = $("#add-service-form");
    if (serviceForm) {
      serviceForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = $("#service-title").value.trim();
        const category = $("#service-category").value;
        const description = $("#service-description").value.trim();
        if (title.length < 3 || description.length < 10) {
          window.EDUVIA?.toast("أكمل اسم الخدمة ووصفها قبل الإضافة.");
          return;
        }
        const services = getArray(KEYS.services);
        services.unshift({
          id: `SVC-${Date.now()}`,
          title,
          category,
          description,
          createdAt: new Date().toISOString()
        });
        if (!setArray(KEYS.services, services)) return;
        serviceForm.reset();
        renderAll();
        window.EDUVIA?.toast("أضيفت الخدمة وستظهر في صفحة الخدمات.");
      });
    }

    const workForm = $("#add-work-form");
    if (workForm) {
      workForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = $("#work-title").value.trim();
        const category = $("#work-category").value;
        const description = $("#work-description").value.trim();
        const tags = $("#work-tags").value.trim() || "تصميم|إخراج";
        if (title.length < 3 || description.length < 8) {
          window.EDUVIA?.toast("أكمل عنوان العمل ووصفه قبل الإضافة.");
          return;
        }
        const works = getArray(KEYS.portfolio);
        works.unshift({
          id: `WORK-${Date.now()}`,
          title,
          category,
          categoryLabel: workCategories[category] || "عمل",
          description,
          tags,
          createdAt: new Date().toISOString()
        });
        if (!setArray(KEYS.portfolio, works)) return;
        workForm.reset();
        renderAll();
        window.EDUVIA?.toast("أضيف العمل وستظهر معاينته في معرض الأعمال.");
      });
    }
  }

  /* -----------------------------------------------------------------------
     Settings
     ----------------------------------------------------------------------- */

  function initSettings() {
    const form = $("#settings-form");
    if (!form) return;
    let settings = {};
    try {
      settings = JSON.parse(localStorage.getItem(KEYS.settings) || "{}");
    } catch (error) {
      settings = {};
    }

    $("#settings-email").value = settings.email || "info@eduvia.example";
    $("#settings-phone").value = settings.phone || "+966 5X XXX XXXX";
    $("#settings-whatsapp").value = settings.whatsapp || "";
    $("#settings-instagram").value = settings.instagram || "";
    $("#settings-x").value = settings.x || "";
    $("#settings-tiktok").value = settings.tiktok || "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const next = {
        email: $("#settings-email").value.trim(),
        phone: $("#settings-phone").value.trim(),
        whatsapp: $("#settings-whatsapp").value.replace(/[^\d+]/g, ""),
        instagram: $("#settings-instagram").value.trim(),
        x: $("#settings-x").value.trim(),
        tiktok: $("#settings-tiktok").value.trim()
      };
      localStorage.setItem(KEYS.settings, JSON.stringify(next));
      window.EDUVIA?.toast("تم حفظ إعدادات التواصل. أعد تحميل صفحات الموقع لتطبيقها.");
    });
  }

  /* -----------------------------------------------------------------------
     Modal helpers
     ----------------------------------------------------------------------- */

  function openAdminModal() {
    const modal = $("#admin-modal");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $(".admin-modal__close", modal)?.focus();
  }

  function closeAdminModal() {
    const modal = $("#admin-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  /* -----------------------------------------------------------------------
     Render all + events
     ----------------------------------------------------------------------- */

  function renderAll() {
    renderStats();
    renderRecentRequests();
    renderRecentMessages();
    renderRequests();
    renderMessages();
    renderContentLists();
  }

  function initEvents() {
    document.addEventListener("click", (event) => {
      const viewRequest = event.target.closest("[data-view-request]");
      if (viewRequest) {
        openRequestModal(viewRequest.dataset.viewRequest);
        return;
      }
      const delRequest = event.target.closest("[data-delete-request]");
      if (delRequest) {
        deleteRequest(delRequest.dataset.deleteRequest);
        return;
      }
      const viewMessage = event.target.closest("[data-view-message]");
      if (viewMessage) {
        openMessageModal(viewMessage.dataset.viewMessage);
        return;
      }
      const delMessage = event.target.closest("[data-delete-message]");
      if (delMessage) {
        deleteMessage(delMessage.dataset.deleteMessage);
        return;
      }
      const delService = event.target.closest("[data-delete-service]");
      if (delService) {
        if (!window.confirm("حذف هذه الخدمة المضافة؟")) return;
        setArray(KEYS.services, getArray(KEYS.services).filter((service) => service.id !== delService.dataset.deleteService));
        renderAll();
        window.EDUVIA?.toast("تم حذف الخدمة.");
        return;
      }
      const delWork = event.target.closest("[data-delete-work]");
      if (delWork) {
        if (!window.confirm("حذف هذا العمل المضاف؟")) return;
        setArray(KEYS.portfolio, getArray(KEYS.portfolio).filter((work) => work.id !== delWork.dataset.deleteWork));
        renderAll();
        window.EDUVIA?.toast("تم حذف العمل.");
      }
    });

    document.addEventListener("change", (event) => {
      const statusSelect = event.target.closest("[data-status-request]");
      if (statusSelect) updateRequestStatus(statusSelect.dataset.statusRequest, statusSelect.value);
    });

    $("#request-search")?.addEventListener("input", renderRequests);
    $("#request-status-filter")?.addEventListener("change", renderRequests);
    $("#export-requests")?.addEventListener("click", exportRequests);
    $("#admin-modal")?.addEventListener("click", (event) => {
      if (event.target === $("#admin-modal")) closeAdminModal();
    });
    $(".admin-modal__close")?.addEventListener("click", closeAdminModal);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAdminModal();
    });

    $("#refresh-dashboard")?.addEventListener("click", () => {
      renderAll();
      window.EDUVIA?.toast("تم تحديث البيانات.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAdminNav();
    initEvents();
    initContentForms();
    initSettings();
    renderAll();
    updateClock();
    setInterval(updateClock, 60000);
  });

  function updateClock() {
    const now = new Date();
    const target = $("#admin-date");
    if (target) {
      target.textContent = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(now);
    }
  }
})();
