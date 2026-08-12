const apiBase = "/api/v1/students";

const $ = (id: string) => document.getElementById(id);
const $input = (id: string) => document.getElementById(id) as HTMLInputElement | null;
const $form = (id: string) => document.getElementById(id) as HTMLFormElement | null;
const $select = (id: string) => document.getElementById(id) as HTMLSelectElement | null;

const elements = {
  statusBadge: $("status-badge"),
  responseBox: $("response-box"),
  studentList: $("student-list"),
  refreshButton: $("refresh-button"),
  lookupForm: $form("lookup-form"),
  lookupInput: $input("lookup-id"),
  lookupResult: $("lookup-result"),
  createForm: $form("create-form"),
  updateForm: $form("update-form"),
  deleteForm: $form("delete-form"),
  updateId: $input("update-id"),
  updateStudentId: $input("update-student-id"),
  updateFirstName: $input("update-first-name"),
  updateLastName: $input("update-last-name"),
  updateBirthDate: $input("update-birth-date"),
  updateGender: $select("update-gender"),
  deleteId: $input("delete-id"),
};

const escapeHtml = (value: unknown) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

const setStatus = (label: string, tone: "success" | "error" | "info" | "neutral") => {
  if (!elements.statusBadge) return;

  const toneClass = {
    success: "badge-success",
    error: "badge-error",
    info: "badge-info",
    neutral: "badge-ghost",
  }[tone] || "badge-ghost";

  elements.statusBadge.className = `badge ${toneClass} gap-2`;
  elements.statusBadge.textContent = label;
};

const renderResponse = (payload: unknown) => {
  if (!elements.responseBox) return;
  elements.responseBox.textContent = JSON.stringify(payload, null, 2);
};

const api = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(apiBase + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data && typeof data === "object" && "message" in data
      ? String((data as { message?: unknown }).message)
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as any;
};

const fillUpdateForm = (student: any) => {
  if (!student) return;

  if (elements.updateId) elements.updateId.value = String(student.id || "");
  if (elements.updateStudentId) elements.updateStudentId.value = student.studentId || "";
  if (elements.updateFirstName) elements.updateFirstName.value = student.firstName || "";
  if (elements.updateLastName) elements.updateLastName.value = student.lastName || "";
  if (elements.updateBirthDate) elements.updateBirthDate.value = student.birthDate || "";
  if (elements.updateGender) elements.updateGender.value = student.gender || "male";
  const updateDetails = document.querySelector('#update') as HTMLDetailsElement | null;
  if (updateDetails) updateDetails.open = true;
  elements.updateForm?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const loadStudents = async () => {
  try {
    setStatus("Loading students...", "info");
    const result = await api("");
    renderStudents(result.data || []);
    renderResponse(result);
    setStatus("Students loaded", "success");
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Failed to load students" });
    setStatus(error instanceof Error ? error.message : "Failed to load students", "error");
  }
};

function renderStudents(students: any[]) {
  if (!elements.studentList) return;

  if (!Array.isArray(students) || students.length === 0) {
    elements.studentList.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-sm text-base-content/40">
          No students found &mdash; use <span class="method-badge method-badge-post text-[0.65rem]">POST</span> to create one.
        </td>
      </tr>
    `;
    return;
  }

  elements.studentList.innerHTML = students.map((student) => `
    <tr class="hover">
      <td class="font-mono text-xs font-semibold">${escapeHtml(student.id)}</td>
      <td>
        <div class="font-medium text-sm">${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</div>
        <div class="font-mono text-xs text-base-content/50">${escapeHtml(student.studentId)}</div>
      </td>
      <td class="font-mono text-xs">${escapeHtml(student.birthDate)}</td>
      <td><span class="method-badge text-[0.65rem] ${student.gender === 'female' ? 'method-badge-delete' : student.gender === 'other' ? 'method-badge-put' : 'method-badge-get'}">${escapeHtml(student.gender)}</span></td>
      <td class="font-mono text-xs text-base-content/40">${escapeHtml(student.createdAt || "")}</td>
      <td class="text-right">
        <div class="flex flex-wrap justify-end gap-1.5">
          <button
            type="button"
            class="btn btn-xs btn-ghost text-primary hover:bg-primary/10"
            data-action="edit"
            data-id="${escapeHtml(student.id)}"
            data-student-id="${escapeHtml(student.studentId)}"
            data-first-name="${escapeHtml(student.firstName)}"
            data-last-name="${escapeHtml(student.lastName)}"
            data-birth-date="${escapeHtml(student.birthDate)}"
            data-gender="${escapeHtml(student.gender)}"
          >Edit</button>
          <button
            type="button"
            class="btn btn-xs btn-ghost text-error hover:bg-error/10"
            data-action="delete"
            data-id="${escapeHtml(student.id)}"
          >Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  elements.studentList.querySelectorAll("[data-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      fillUpdateForm({
        id: button.getAttribute("data-id"),
        studentId: button.getAttribute("data-student-id"),
        firstName: button.getAttribute("data-first-name"),
        lastName: button.getAttribute("data-last-name"),
        birthDate: button.getAttribute("data-birth-date"),
        gender: button.getAttribute("data-gender"),
      });
    });
  });

  elements.studentList.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      if (!id) return;

      if (!window.confirm(`Delete student #${id}?`)) return;

      try {
        setStatus(`Deleting student #${id}...`, "info");
        const result = await api(`/${id}`, { method: "DELETE" });
        renderResponse(result);
        setStatus("Student deleted", "success");
        await loadStudents();
      } catch (error) {
        renderResponse({ success: false, message: error instanceof Error ? error.message : "Delete failed" });
        setStatus(error instanceof Error ? error.message : "Delete failed", "error");
      }
    });
  });
}

const toPayload = (form: FormData, fields: string[]) => {
  const data: Record<string, string> = {};
  for (const field of fields) {
    const value = form.get(field);
    if (typeof value === "string") data[field] = value.trim();
  }
  return data;
};

elements.refreshButton?.addEventListener("click", loadStudents);

elements.lookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = String(elements.lookupInput?.value || "").trim();

  if (!id) {
    setStatus("Enter an ID to fetch", "error");
    return;
  }

  try {
    setStatus(`Fetching student #${id}...`, "info");
    const result = await api(`/${id}`);
    renderResponse(result);
    setStatus("Student loaded", "success");
    if (elements.lookupResult) {
      elements.lookupResult.textContent = result.data ? `${result.data.firstName} ${result.data.lastName}` : "No record";
    }
    fillUpdateForm(result.data);
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Fetch failed" });
    setStatus(error instanceof Error ? error.message : "Fetch failed", "error");
    if (elements.lookupResult) elements.lookupResult.textContent = "No record";
  }
});

const lookupStudentIdForm = $form("lookup-student-id-form");
const lookupStudentIdInput = $input("lookup-student-id-input");
const lookupStudentIdResult = $("lookup-student-id-result");

lookupStudentIdForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentId = String(lookupStudentIdInput?.value || "").trim();

  if (!studentId) {
    setStatus("Enter a student ID to fetch", "error");
    return;
  }

  try {
    setStatus(`Fetching student ${studentId}...`, "info");
    const result = await api(`/student/${studentId}`);
    renderResponse(result);
    setStatus("Student loaded", "success");
    if (lookupStudentIdResult) {
      lookupStudentIdResult.textContent = result.data ? `${result.data.firstName} ${result.data.lastName}` : "No record";
    }
    fillUpdateForm(result.data);
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Fetch failed" });
    setStatus(error instanceof Error ? error.message : "Fetch failed", "error");
    if (lookupStudentIdResult) lookupStudentIdResult.textContent = "No record";
  }
});

elements.createForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(elements.createForm!);

  try {
    setStatus("Creating student...", "info");
    const payload = toPayload(form, ["studentId", "firstName", "lastName", "birthDate", "gender"]);
    const result = await api("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    renderResponse(result);
    setStatus("Student created", "success");
    elements.createForm?.reset();
    await loadStudents();
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Create failed" });
    setStatus(error instanceof Error ? error.message : "Create failed", "error");
  }
});

elements.updateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(elements.updateForm!);
  const id = String(form.get("id") || "").trim();

  if (!id) {
    setStatus("Enter an ID to update", "error");
    return;
  }

  try {
    setStatus(`Updating student #${id}...`, "info");
    const payload = toPayload(form, ["studentId", "firstName", "lastName", "birthDate", "gender"]);
    const result = await api(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    renderResponse(result);
    setStatus("Student updated", "success");
    await loadStudents();
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Update failed" });
    setStatus(error instanceof Error ? error.message : "Update failed", "error");
  }
});

elements.deleteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = String(elements.deleteId?.value || "").trim();

  if (!id) {
    setStatus("Enter an ID to delete", "error");
    return;
  }

  try {
    setStatus(`Deleting student #${id}...`, "info");
    const result = await api(`/${id}`, { method: "DELETE" });
    renderResponse(result);
    setStatus("Student deleted", "success");
    elements.deleteForm?.reset();
    await loadStudents();
  } catch (error) {
    renderResponse({ success: false, message: error instanceof Error ? error.message : "Delete failed" });
    setStatus(error instanceof Error ? error.message : "Delete failed", "error");
  }
});

loadStudents();
