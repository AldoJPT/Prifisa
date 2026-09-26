document.addEventListener('DOMContentLoaded', async () => {
  const postsContainer = document.getElementById('posts-container');

  if (!postsContainer) {
    console.error('No existe el contenedor #posts-container en publicaciones.html');
    return;
  }

  const { data, error } = await supabaseClient
    .from('posts')
    .select('title,slug,excerpt,cover_url,image_url,created_at')
    .eq('status', 'published');

  if (error) {
    console.error('Error de Supabase:', error);
    postsContainer.innerHTML = `
      <div class="empty-state">
        <h2>No se pudieron cargar las publicaciones</h2>
        <p>${error.message}</p>
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <h2>Aún no hay publicaciones disponibles</h2>
        <p>Muy pronto compartiremos nuevos recursos.</p>
      </div>
    `;
    return;
  }

  postsContainer.innerHTML = data.map(post => {
    const imageUrl = post.image_url || post.cover_url;

    return `
      <article class="blog-card">
        <a href="post.html?slug=${post.slug}" class="blog-card-link">
          <div class="blog-card-image">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${post.title}">`
                : `<div class="blog-placeholder"></div>`
            }
          </div>

          <div class="blog-card-content">
            <span class="blog-category">PRIFISA</span>
            <h2>${post.title}</h2>
            <p>${post.excerpt || ''}</p>
            <span class="read-more">Leer más</span>
          </div>
        </a>
      </article>
    `;
  }).join('');
});