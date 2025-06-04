/**
 * Função para obter o caminho completo de uma imagem
 * @param path Caminho da imagem
 * @returns Caminho completo da imagem
 */
export function getImagePath(path: string | null | undefined): string {
  // Se o caminho for nulo ou indefinido, retornar imagem padrão
  if (!path) {
    return "/a-cute-pet.png"
  }

  // Se o caminho já for uma URL completa, retornar como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Se o caminho já começar com /, retornar como está
  if (path.startsWith("/")) {
    return path
  }

  // Caso contrário, adicionar / no início
  return `/${path}`
}

/**
 * Função para obter o caminho completo de uma imagem de ONG
 * @param path Caminho da imagem
 * @returns Caminho completo da imagem
 */
export function getOngLogoPath(path: string | null | undefined): string {
  // Se o caminho for nulo ou indefinido, retornar imagem padrão
  if (!path) {
    return "/logo.png"
  }

  // Se o caminho já for uma URL completa, retornar como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Se o caminho já começar com /, retornar como está
  if (path.startsWith("/")) {
    return path
  }

  // Caso contrário, adicionar / no início
  return `/${path}`
}

/**
 * Função para obter o caminho completo de uma imagem de usuário
 * @param path Caminho da imagem
 * @returns Caminho completo da imagem
 */
export function getUserAvatarPath(path: string | null | undefined): string {
  // Se o caminho for nulo ou indefinido, retornar imagem padrão
  if (!path) {
    return "/user-avatar.png"
  }

  // Se o caminho já for uma URL completa, retornar como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Se o caminho já começar com /, retornar como está
  if (path.startsWith("/")) {
    return path
  }

  // Caso contrário, adicionar / no início
  return `/${path}`
}
