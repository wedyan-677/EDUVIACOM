/* ==========================================================================
   EDUVIA — Service request flow
   ========================================================================== */

(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const STORAGE_KEY = "eduvia_requests_v1";

  const stageLabels = {
    primary: "المرحلة الابتدائية",
    middle: "المرحلة المتوسطة",
    high: "المرحلة الثانوية",
    university: "المرحلة الجامعية"
  };

  const serviceCatalog = {
    brochure: { label: "تصميم المطويات التعليمية والإبداعية", category: "school" },
    activities: { label: "إعداد الأنشطة المدرسية", category: "school" },
    worksheets: { label: "تصميم أوراق العمل", category: "school" },
    presentation: { label: "إعداد العروض التقديمية PowerPoint", category: "school" },
    tutoring: { label: "شرح المواد الدراسية", category: "school" },
    summaries: { label: "تلخيص المناهج والمواد الدراسية", category: "school" },
    "teaching-tools": { label: "إعداد وسائل تعليمية مبتكرة", category: "school" },
    "school-projects": { label: "تصميم مشاريع مدرسية", category: "school" },
    "university-projects": { label: "إعداد وتنسيق المشاريع الجامعية", category: "university" },
    "university-presentation": { label: "تصميم العروض التقديمية الجامعية", category: "university" },
    "research-formatting": { label: "تنسيق الأبحاث والتقارير", category: "university" },
    "university-summaries": { label: "تلخيص المقررات الجامعية", category: "university" },
    infographic: { label: "تصميم الإنفوجرافيك والعروض التعليمية", category: "university" },
    "university-output": { label: "تنسيق المشاريع وإخراجها احترافيًا", category: "university" },
    other: { label: "خدمة أخرى / غير محددة", category: "all" }
  };

  function normalizePhone(value) {
    const arabic = "٠١٢٣٤٥٦٧٨٩";
    return String(value)
      .replace(/[٠-٩]/g, (digit) => arabic.indexOf(digit))
      .replace(/[\s\-()]/g, "")
      .trim();
  }

  function isValidSaudiPhone(value) {
    return /^(?:\+9665|009665|05)\d{8}$/.test(normalizePhone(value));
  }

  function readRequests() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function saveRequests(requests) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatDateArabic(isoDate) {
    if (!isoDate) return "غير محدد";
    const date = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function setFieldError(field, message) {
    if (!field) return;
    const group = field.closest(".form-group");
    field.setAttribute("aria-invalid", "true");
    let error = group?.querySelector(".field-error");
    if (!error && group) {
      error = document.createElement("span");
      error.className = "field-error";
      error.setAttribute("role", "alert");
      group.append(error);
    }
    if (error) error.textContent = message;
  }

  function clearFieldError(field) {
    if (!field) return;
    field.removeAttribute("aria-invalid");
    field.closest(".form-group")?.querySelector(".field-error")?.remove();
  }

  function createReference() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `EDU-${year}-${random}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#request-form");
    if (!form) return;

    const nameField = $("#request-name");
    const phoneField = $("#request-phone");
    const emailField = $("#request-email");
    const stageField = $("#request-stage");
    const serviceField = $("#request-service");
    const detailsField = $("#request-details");
    const deadlineField = $("#request-deadline");
    const consentField = $("#request-consent");
    const serviceHelp = $("#service-help");
    const success = $("#request-success");
    const submitButton = $("#request-submit");
    const formSection = $("#request-form-section");

    const allOptions = Array.from(serviceField.options).map((option) => ({
      element: option,
      value: option.value,
      category: option.dataset.category,
      label: option.textContent.trim()
    }));

    function categoryForStage(stage) {
      if (!stage) return "all";
      return stage === "university" ? "university" : "school";
    }

    function filterServices(stage, preserveValue = true) {
      const category = categoryForStage(stage);
      const current = serviceField.value;
      allOptions.forEach(({ element, category: optionCategory }) => {
        const visible = category === "all" || optionCategory === category || optionCategory === "all";
        element.hidden = !visible;
        element.disabled = !visible;
      });
      if (preserveValue && current) {
        const selected = allOptions.find((option) => option.value === current);
        if (selected && !selected.element.disabled) return;
      }
      serviceField.value = "";
      if (serviceHelp) {
        serviceHelp.textContent =
          category === "university"
            ? "تظهر الآن خدمات المرحلة الجامعية."
            : category === "school"
              ? "تظهر الآن الخدمات المدرسية."
              : "اختر المرحلة أولًا لعرض الخدمات المناسبة.";
      }
    }

    stageField.addEventListener("change", () => {
      filterServices(stageField.value);
    });

    // Allow deep links from service cards: request.html?service=presentation
    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get("service");
    if (requestedService) {
      if (requestedService.startsWith("custom-")) {
        const customId = requestedService.replace(/^custom-/, "");
        if (customId === "work") {
          const option = new Option("عمل مخصص مشابه لنموذج في المعرض", "custom-work");
          option.dataset.category = "all";
          serviceField.add(option);
          serviceField.value = "custom-work";
        } else {
          try {
            const services = JSON.parse(localStorage.getItem("eduvia_services_v1") || "[]");
            const custom = Array.isArray(services) ? services.find((item) => String(item.id) === customId) : null;
            if (custom) {
              const option = new Option(custom.title, requestedService);
              option.dataset.category = custom.category === "university" ? "university" : "school";
              option.dataset.custom = "true";
              serviceField.add(option);
              stageField.value = custom.category === "university" ? "university" : "primary";
            }
          } catch (error) {
            // Ignore malformed local content.
          }
        }
      } else {
        const catalogEntry = serviceCatalog[requestedService];
        if (catalogEntry) {
          const matchingOption = allOptions.find((option) => option.value === requestedService);
          if (matchingOption) {
            if (catalogEntry.category === "university") {
              stageField.value = "university";
            } else if (catalogEntry.category === "school" && !stageField.value) {
              stageField.value = "primary";
            }
            serviceField.value = requestedService;
          }
        }
      }
    }

    filterServices(stageField.value, true);

    // Minimum delivery date is today.
    const today = new Date();
    const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    deadlineField.min = minDate;

    [nameField, phoneField, emailField, detailsField, deadlineField].forEach((field) => {
      field.addEventListener("input", () => clearFieldError(field));
      field.addEventListener("change", () => clearFieldError(field));
    });
    [stageField, serviceField, consentField].forEach((field) => {
      field.addEventListener("change", () => clearFieldError(field));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;

      const fields = [nameField, phoneField, emailField, detailsField, deadlineField];
      fields.forEach((field) => {
        field.value = field.value.trim();
        clearFieldError(field);
      });
      clearFieldError(stageField);
      clearFieldError(serviceField);
      clearFieldError(consentField);

      if (nameField.value.length < 2) {
        setFieldError(nameField, "يرجى كتابة الاسم الكامل (حرفان على الأقل).");
        valid = false;
      }
      if (!isValidSaudiPhone(phoneField.value)) {
        setFieldError(phoneField, "أدخل رقم جوال سعودي صحيح يبدأ بـ 05 أو +9665.");
        valid = false;
      }
      if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailField.value)) {
        setFieldError(emailField, "البريد الإلكتروني غير صحيح.");
        valid = false;
      }
      if (!stageField.value) {
        setFieldError(stageField, "يرجى تحديد المرحلة الدراسية.");
        valid = false;
      }
      if (!serviceField.value) {
        setFieldError(serviceField, "يرجى تحديد الخدمة المطلوبة.");
        valid = false;
      }
      if (detailsField.value.length < 15) {
        setFieldError(detailsField, "اكتب 15 حرفًا على الأقل لتوضيح تفاصيل الطلب.");
        valid = false;
      }
      if (!deadlineField.value) {
        setFieldError(deadlineField, "يرجى تحديد موعد التسليم المطلوب.");
        valid = false;
      } else if (deadlineField.value < minDate) {
        setFieldError(deadlineField, "لا يمكن اختيار تاريخ سابق لتاريخ اليوم.");
        valid = false;
      }
      if (!consentField.checked) {
        setFieldError(consentField, "يرجى الموافقة على استخدام البيانات لمعالجة الطلب.");
        valid = false;
      }

      if (!valid) {
        $("[aria-invalid='true']", form)?.focus();
        return;
      }

      const serviceOption = serviceField.options[serviceField.selectedIndex];
      const serviceLabel = serviceOption?.textContent.trim() || "خدمة غير محددة";
      const stageLabel = stageLabels[stageField.value] || "مرحلة غير محددة";
      const reference = createReference();

      const request = {
        id: `REQ-${Date.now()}`,
        reference,
        name: nameField.value,
        phone: normalizePhone(phoneField.value),
        phoneDisplay: phoneField.value,
        email: emailField.value,
        stage: stageField.value,
        stageLabel,
        service: serviceField.value,
        serviceLabel,
        details: detailsField.value,
        deadline: deadlineField.value,
        createdAt: new Date().toISOString(),
        status: "new",
        read: false
      };

      const requests = readRequests();
      requests.unshift(request);
      if (!saveRequests(requests)) {
        window.EDUVIA?.toast("تعذر حفظ الطلب في هذا المتصفح. تحقق من إعدادات التخزين.");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "جارٍ حفظ الطلب…";
      }

      // Build the confirmation view.
      $("#success-name").textContent = request.name;
      $("#success-ref").textContent = request.reference;
      $("#summary-service").textContent = request.serviceLabel;
      $("#summary-stage").textContent = request.stageLabel;
      $("#summary-deadline").textContent = formatDateArabic(request.deadline);

      form.hidden = true;
      $("#request-form-intro", formSection)?.setAttribute("hidden", "");
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      success.focus?.();
      window.EDUVIA?.toast("تم حفظ طلبك بنجاح. يمكنك متابعته من لوحة الإدارة المحلية.");

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال الطلب <svg class="icon icon--arrow" aria-hidden="true"><use href="#i-arrow"></use></svg>';
      }
    });

    const resetButton = $("#request-reset");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        form.reset();
        success.hidden = true;
        form.hidden = false;
        filterServices("");
        $("#request-form-intro", formSection)?.removeAttribute("hidden");
        deadlineField.min = minDate;
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        nameField.focus();
      });
    }
  });
})();
