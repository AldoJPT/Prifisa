/* =========================================================
   PRIFISA - Panel de admin (CRUD de publicaciones)
   ========================================================= */

const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const postForm = document.getElementById('postForm');
const formTitle = document.getElementById('formTitle');
const formMsg = document.getElementById('formMsg');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const postsListEl = document.getElementById('postsList');

const fields = {
  id: document.getElementById('postId'),
  title: document.getElementById('title'),
  slug: document.getElementById('slug'),
  category: document.getElementById('category'),
  image_url: document.getElementById('image_url'),
  excerpt: document.getElementById('excerpt'),
  content: document.getElementById('content'),
  published: document.getElementById('published'),
};

let slugManuallyEdited = false;

function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

fields.title.addEventListener('input', () => {
  if (!slugManuallyEdited) {
    fields.slug.value = slugify(fields.title.value);
  }
});
fields.slug.addEventListener('input', () => { slugManuallyEdited = true; });

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = 'admin-msg show ' + type;
  setTimeout(() => formMsg.classList.remove('show'), 4000);
}

function resetForm() {
  postForm.reset();
  fields.id.value = '';
  slugManuallyEdited = false;
  formTitle.textContent = 'Nueva publicación';
  saveBtn.textContent = 'Guardar publicación';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', resetForm);

/* ---------------------------------------------------------
   1. PROTEGER LA PÁGINA (auth guard)
   --------------------------------------------------------- */
(async function initAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  userEmailEl.textContent = session.user.email;
  loadPosts();
})();

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = 'login.html';
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
});

/* ---------------------------------------------------------
   2. CARGAR LISTADO DE PUBLICACIONES
   --------------------------------------------------------- */
async function loadPosts() {
  postsListEl.innerHTML = '<div class="admin-loading">Cargando publicaciones...</div>';

  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    postsListEl.innerHTML = `<div class="admin-empty">Error al cargar: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    postsListEl.innerHTML = '<div class="admin-empty">Aún no hay publicaciones. Crea la primera con el formulario.</div>';
    return;
  }

  postsListEl.innerHTML = '';
  data.forEach(post => {
    const row = document.createElement('div');
    row.className = 'post-row';
    const date = new Date(post.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    row.innerHTML = `
      <div class="post-row-info">
        <h4>${escapeHtml(post.title)}</h4>
        <div class="post-row-meta">
          <span class="status-pill ${post.published ? 'published' : 'draft'}">${post.published ? 'Publicado' : 'Borrador'}</span>
          <span>${escapeHtml(post.category)}</span>
          <span>${date}</span>
        </div>
      </div>
      <div class="post-row-actions">
        <button data-action="toggle" data-id="${post.id}" data-published="${post.published}">${post.published ? 'Despublicar' : 'Publicar'}</button>
        <button data-action="edit" data-id="${post.id}">Editar</button>
        <button data-action="delete" data-id="${post.id}" class="danger">Borrar</button>
      </div>
    `;
    postsListEl.appendChild(row);
    row.dataset.postJson = JSON.stringify(post);
  });

  postsListEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', handlePostAction);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ---------------------------------------------------------
   3. ACCIONES SOBRE CADA PUBLICACIÓN
   --------------------------------------------------------- */
async function handlePostAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const row = btn.closest('.post-row');
  const post = JSON.parse(row.dataset.postJson);

  if (action === 'edit') {
    fields.id.value = post.id;
    fields.title.value = post.title;
    fields.slug.value = post.slug;
    fields.category.value = post.category;
    fields.image_url.value = post.image_url || '';
    fields.excerpt.value = post.excerpt;
    fields.content.value = post.content;
    fields.published.checked = post.published;
    slugManuallyEdited = true;
    formTitle.textContent = 'Editando: ' + post.title;
    saveBtn.textContent = 'Guardar cambios';
    cancelEditBtn.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (action === 'toggle') {
    const newStatus = btn.dataset.published !== 'true';
    const { error } = await supabaseClient.from('posts').update({ published: newStatus }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    loadPosts();
    return;
  }

  if (action === 'delete') {
    if (!confirm(`¿Seguro que quieres borrar "${post.title}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabaseClient.from('posts').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    loadPosts();
    return;
  }
}

/* ---------------------------------------------------------
   4. GUARDAR (crear o actualizar)
   --------------------------------------------------------- */
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando...';

  const payload = {
    title: fields.title.value.trim(),
    slug: slugify(fields.slug.value.trim()),
    category: fields.category.value,
    image_url: fields.image_url.value.trim() || null,
    excerpt: fields.excerpt.value.trim(),
    content: fields.content.value.trim(),
    published: fields.published.checked,
  };

  let result;
  if (fields.id.value) {
    result = await supabaseClient.from('posts').update(payload).eq('id', fields.id.value);
  } else {
    result = await supabaseClient.from('posts').insert(payload);
  }

  saveBtn.disabled = false;

  if (result.error) {
    showMsg('Error: ' + result.error.message, 'error');
    saveBtn.textContent = fields.id.value ? 'Guardar cambios' : 'Guardar publicación';
    return;
  }

  showMsg(fields.id.value ? 'Publicación actualizada.' : 'Publicación creada.', 'success');
  resetForm();
  loadPosts();
});
