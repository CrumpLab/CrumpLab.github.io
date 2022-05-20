#' create index.html for articles blog page
#'
#' @description This function replaces `pkgdown::build_articles_index` which does not allow override of site-wide settings in`_pkgdown.yml`. This function allows overrides for `articles/index.html`, which I am currently using to list blog posts. As a result, it is possible to have unique meta tags (or other unique features) specified through overrides for this page that are different from the site-wide tags.
#'
#' @param pkg The package name
#' @param override a list of overrides, defaults to the overrides specified in `_blog.yml`
#'
#' @return builds the `articles/index.html` page
#' @export
#'
#' @examples
#' \dontrun{
#' crumplab_blog_index()
#' }
crumplab_blog_index <- function(pkg=".", override = yaml::read_yaml("_blog.yml")){
  pkg <- pkgdown:::section_init(pkg, depth = 1L, override = override)
  pkgdown::build_articles_index(pkg)
}

#' build blog pages
#'
#' @description Builds all vignettes using`pkgdown::build_articles()` and then tweaks the list of articles on the blog page by running `crumplab_blog_index()`.
#'
#' @return builds all vignettes and tweaks blog index
#' @export
#'
#' @examples
#' \dontrun{
#' crumplab_blog()
#' }
crumplab_blog <- function(){
  pkgdown::build_articles()
  crumplab_blog_index()
}

#' build site and then tweak
#'
#' @description Equivalent of `pkgdown::build_site()` but tweaks the blog index page at the end by running `crumplab_blog_index()`
#'
#' @return The pkgdown website
#' @export
#'
#' @examples
#' \dontrun{
#' crumplab_site()
#' }
crumplab_site <- function(){
  pkgdown::build_site()
  crumplab_blog_index()
}





