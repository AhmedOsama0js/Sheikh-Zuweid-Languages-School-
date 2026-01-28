// DOM Elements
const gradeSelect = document.querySelector("#gradeSelect");
const gelosInput = document.querySelector("#gelosInput");
const btnSearch = document.querySelector("#btnSearch");
const resultsSection = document.querySelector("#resultsSection");

const gradeError = document.querySelector("#gradeError");
const gelosError = document.querySelector("#gelosError");

const studentName = document.querySelector("#studentName");
const subjectsTableBody = document.querySelector("#subjectsTableBody");
const totalScoreCell = document.querySelector("#totalScoreCell");
const btnDownload = document.querySelector("#btnDownload");
const btnPrint = document.querySelector("#btnPrint");

let database = null;

// Initialize Data
const init = async () => {
  try {
    const response = await fetch("./Languages-Sheikh-Zuweid.json");
    if (!response.ok) throw new Error("Database file error");
    database = await response.json();
    console.log("Database successfully loaded");
  } catch (err) {
    console.error("Data loading error:", err);
  }
};

// Error Handlers
const showError = (el, msg) => {
  el.textContent = msg;
  el.animate([
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' }
  ], { duration: 200, iterations: 3 });
};

const clearErrors = () => {
  gradeError.textContent = "";
  gelosError.textContent = "";
};

// Print Logic
btnPrint.addEventListener("click", () => {
  window.print();
});

// Download Logic
btnDownload.addEventListener("click", () => {
  if (typeof html2canvas === 'undefined') {
    alert("عذراً، لم يتم تحميل مكتبة التصوير بالشكل الصحيح. يرجى التأكد من اتصال الإنترنت.");
    return;
  }

  const card = document.querySelector("#resultsSection > div");
  if (!card) return;

  btnDownload.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...`;
  btnDownload.disabled = true;

  html2canvas(card, {
    scale: 2,
    logging: false,
    useCORS: false,
    backgroundColor: "#ffffff",
    windowWidth: card.scrollWidth,
    windowHeight: card.scrollHeight
  }).then(canvas => {
    try {
      const link = document.createElement("a");
      link.download = `نتيجة_${studentName.textContent || 'الطالب'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      btnDownload.innerHTML = `<i class="fa-solid fa-download"></i> تحميل كصورة`;
      btnDownload.disabled = false;
    } catch (e) {
      console.error("Canvas toDataURL error:", e);
      throw new Error("Security restriction");
    }
  }).catch(err => {
    console.error("Download execution error:", err);
    alert("تنبيه: ميزة 'تحميل كصورة' تتطلب تشغيل الموقع عبر (Live Server) نظراً لقيود الأمان في المتصفح. يمكنك استخدام زر 'الطباعة' كبديل مباشر ومضمون.");
    btnDownload.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> فشل التحميل`;
    btnDownload.disabled = false;
  });
});

// Search Logic
btnSearch.addEventListener("click", () => {
  clearErrors();

  const gradeKey = gradeSelect.value;
  const idValue = gelosInput.value.trim();

  let valid = true;

  if (gradeKey === "اختر الصف التعليمي" || !gradeKey) {
    showError(gradeError, "يرجى اختيار الصف التعليمي");
    valid = false;
  }

  if (!idValue) {
    showError(gelosError, "يرجى كتابة رقم الجلوس");
    valid = false;
  }

  if (!valid || !database) return;

  const schoolYear = database[gradeKey];
  if (!schoolYear) {
    showError(gradeError, "بيانات هذا الصف غير متوفرة حالياً");
    return;
  }

  const student = schoolYear.find(s => s.Student_ID == idValue);

  if (student) {
    renderCard(student);
  } else {
    showError(gelosError, "عفواً، رقم الجلوس غير صحيح أو غير موجود في هذا الصف");
    resultsSection.classList.add("hidden");
  }
});

// Dictionary for subject labels and icons
const subjectConfig = {
  "Arabic": { label: "اللغة العربية", icon: "fa-book" },
  "mathematics": { label: "الرياضيات", icon: "fa-calculator" },
  "english": { label: "اللغة الإنجليزية", icon: "fa-language" },
  "Multidisciplinary": { label: "اكتشف (المتعدد)", icon: "fa-puzzle-piece" },
  "Religious_Education": { label: "التربية الدينية", icon: "fa-mosque" },
  "physical_education": { label: "التربية الرياضية", icon: "fa-person-running" },
  "Tokatsu_activities": { label: "أنشطة التوكاسو", icon: "fa-users-gear" },
  "connet_plus": { label: "مستوي رفيع انجليزي", icon: "fa-plus-circle" },
  "connect_plus": { label: "مستوي رفيع انجليزي", icon: "fa-plus-circle" },
  "Health_education": { label: "التربية الصحية", icon: "fa-heart-pulse" },
  "Sciences": { label: "العلوم", icon: "fa-flask-vial" },
  "Social_Studies": { label: "الدراسات الاجتماعية", icon: "fa-earth-africa" },
  "Professional_skills": { label: "المهارات المهنية", icon: "fa-screwdriver-wrench" },
  "technology": { label: "التكنولوجيا", icon: "fa-laptop-code" },
  "art": { label: "التربية الفنية", icon: "fa-palette" }
};

// Render Table Results
const renderCard = (data) => {
  resultsSection.classList.remove("hidden");
  studentName.textContent = data.name;

  const excludeKeys = ["id", "name", "Student_ID", "total"];
  const subjectKeys = Object.keys(data).filter(key => !excludeKeys.includes(key));

  subjectsTableBody.innerHTML = subjectKeys
    .map((key, i) => {
      const config = subjectConfig[key] || { label: key, icon: "fa-star" };
      return `
      <tr class="hover:bg-slate-50/80 transition-all animate-in fade-in slide-in-from-right-4 duration-500 group" style="animation-delay: ${i * 0.05}s">
        <td class="p-3 md:p-4 flex items-center gap-4 text-right relative overflow-hidden">
            <!-- Aesthetic Detail: Gradient side line -->
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-600 text-sm">
                <i class="fa-solid ${config.icon}"></i>
            </div>
            <span class="text-sm md:text-base text-slate-700 font-bold">${config.label}</span>
        </td>
        <td class="p-3 md:p-4 text-center">
            <span class="text-xl md:text-2xl font-black text-slate-900">${data[key]}</span>
        </td>
      </tr>
    `;
    }).join('');

  const totalVal = data.total;
  if (totalVal !== undefined) {
    animateTotal(totalScoreCell, parseFloat(totalVal));
  } else {
    totalScoreCell.textContent = "-";
  }

  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function animateTotal(el, target) {
  let current = 0;
  const increment = target / 40;
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(interval);
    } else {
      el.textContent = Math.ceil(current);
    }
  }, 15);
}

init();
