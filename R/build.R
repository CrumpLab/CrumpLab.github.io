#' create index.html for articles blog page
#'
#' @param pkg
#' @param override
#'
#' @return
#' @export
#'
#' @examples
crumplab_blog_index <- function(pkg=".",override = yaml::read_yaml("_blog.yml")){
  pkg <- pkgdown:::section_init(pkg, depth = 1L, override = override)
  pkgdown::build_articles_index(pkg)
}

#' build blog pages
#'
#' @return
#' @export
#'
#' @examples
crumplab_blog <- function(){
  pkgdown::build_articles()
  crumplab_blog_index()
}





