/* =========================================================
   PRIFISA - Carga de un artículo individual (post.html)
   ========================================================= */

function escapeHtmlPost(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatDatePost(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Convierte el texto plano del editor en párrafos HTML
// (líneas en blanco separan párrafos; líneas que empiezan con "- " se agrupan en listas)
function renderContent(raw) {
  const blocks = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.every(l => l.startsWith('- '))) {
      const items = lines.map(l => `<li>${escapeHtmlPost(l.slice(2))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${escapeHtmlPost(block).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const container = document.getElementById('postContainer');

  if (!slug) {
    container.innerHTML = `<div class="blog-empty"><h3>Publicación no encontrada</h3><p>Revisa el enlace o vuelve al listado de publicaciones.</p></div>`;
    return;
  }

  const { data: post, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) {
    container.innerHTML = `<div class="blog-empty"><h3>Publicación no encontrada</h3><p>Es posible que haya sido eliminada o despublicada.</p></div>`;
    return;
  }

  document.title = post.title + ' | PRIFISA';
  const metaDesc = document.getElementById('pageDescription');
  if (metaDesc) metaDesc.setAttribute('content', post.excerpt || '');

  container.innerHTML = `
    <div class="blog-meta">
      <span class="blog-category">${escapeHtmlPost(post.category)}</span>
      <span class="blog-date">${formatDatePost(post.created_at)}</span>
    </div>
    <h1>${escapeHtmlPost(post.title)}</h1>
    ${(post.image_url || post.cover_url) ? `<div class="blog-image" style="aspect-ratio:21/9;border-radius:var(--radius-lg);margin-bottom:36px;overflow:hidden;"><img src="${escapeHtmlPost(post.image_url || post.cover_url)}" alt="${escapeHtmlPost(post.title)}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}
    <div class="post-content-body">${renderContent(post.content)}</div>
  `;
}

document.addEventListener('DOMContentLoaded', loadPost);
