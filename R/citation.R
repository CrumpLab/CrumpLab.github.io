#' add link
#'
#' writes html for named url link to r markdown
#'
#' @param url_path string, url
#' @param url_text string, url link name
#'
#' @return html url link
#' @export
#'
#' @examples
#' add_link("https://www.crumplab.com","crumplab.com")
#'
add_link <- function(url_path,url_text){
  html <- glue::glue("<a href = '{url_path}'> {url_text} </a>")
  cat(html, sep="")
}

#' add link and icon
#'
#' writes html for named url link to r markdown with font awesome icon
#'
#' @param url_path string, the url
#' @param url_text string, name
#' @param icon_class string, font awesome icon class
#'
#' @return html for link with icon and text
#' @export
#'
#' @examples
#' add_link_icon("https://www.crumplab.com","crumplab.com","fas fa-globe")
#'
add_link_icon <- function(url_path,url_text, icon_class){
  html <- glue::glue('<a href = "{url_path}"> <i class="{icon_class}"> {url_text} </i></a>')
  cat("  ",html, sep="")
}

#' Generate a publication list from a bib file
#'
#' @description This function takes a .bib file as input, along with a specially formatted .yml file and embeds a publication list into an R Markdown document.
#'
#' @param bib a .bib file
#' @param yml a formatted .yml file see example
#' @param pdf_dir relative path to directory containing pdfs
#' @param base_url_to_pdfs url to path containing pdfs
#'
#' @return publication list with links
#' @export
#'
#' @examples
#' \dontrun{
#' bib_2_pub_list("Crump.bib",
#' "Crump.yml",
#' "pkgdown/assets/Crump/files",
#' "https://www.crumplab.com/Crump/files")
#' }
bib_2_pub_list <- function(bib,yml,pdf_dir,base_url_to_pdfs){

  # load bib file to df
  bib_df <- bib2df::bib2df(bib)

  # clean {{}} from entries
  # to do: improve this part
  bib_df$TITLE <- stringi::stri_replace_all_regex(bib_df$TITLE, "[\\{\\}]", "")
  bib_df$JOURNAL <- stringi::stri_replace_all_regex(bib_df$JOURNAL, "[\\{\\}]", "")
  bib_df$BOOKTITLE <- stringi::stri_replace_all_regex(bib_df$BOOKTITLE, "[\\{\\}]", "")

  # sort bib_df by year
  # to do: add sort options
  bib_df <- bib_df[order(bib_df$DATE, decreasing=T),]

  # read yml with links for bib entries
  yml_links <- yaml::read_yaml(yml)

  # print entries

  for (i in 1:dim(bib_df)[1] ){

    # convert row to .bib entry
    # to do: make row to bib entry a function
    t_bib_entry <- paste0(capture.output(bib2df::df2bib(bib_df[i,])), collapse="")
    # generate markdown text for citation
    t_md_citation<- paste0(stevemisc::print_refs(t_bib_entry,csl = "apa.csl",
                                                 spit_out = FALSE,
                                                 delete_after = FALSE), collapse=" ")
    cat(t_md_citation)

    cat("<span class = 'publinks'>")

    ### add pdf links
    if( !is.na(bib_df$FILE[i]) ) { #check pdf exists

      pdf_name <- basename(bib_df$FILE[i])
      rel_path_to_pdf <- list.files(here::here(pdf_dir),
                                    basename(bib_df$FILE[i]),
                                    recursive=T)
      build_url <- paste0(base_url_to_pdfs,"/",rel_path_to_pdf,collapse="")
      crumplab::add_link_icon(build_url,"pdf","fas fa-file-pdf")

    }

    ## add all other links
    if( exists(bib_df$BIBTEXKEY[i],yml_links) ) { # check yml bib entry exists

      link_list <- yml_links[[bib_df$BIBTEXKEY[i]]]

      for(l in link_list){
        crumplab::add_link_icon(l$url,l$name,l$icon)
      }

    }
    cat("</span>")
    cat("\n\n")
  }

}

#' Convert bib entries to markdown for printing citations in text
#'
#' This is a convenience wrapper function for printing full csl-style bibliographic entries in the middle of an R Markdown document.
#'
#' @param cite_key character vector, a vector of citation keys from a .bib file
#' @param bib_file string, path to .bib file
#' @param csl_file sting, name of csl style file, default is apa.csl
#'
#' @return markdown The markdown to be written into the R Markdown document. Suggested use case is to call this function in an R code chunk with results="asis"
#' @export
#'
bib2md <- function(cite_key,
                   bib_file,
                   csl_file = "apa.csl"){

  import_bib <- RefManageR::ReadBib(bib_file)
  single_citation <- RefManageR::toBiblatex(import_bib[[cite_key]])
  stevemisc::print_refs(paste(single_citation,collapse=""),csl=csl_file)

}

#' Convert bib entries to annotation entries for R markdown
#'
#' This is a convenience wrapper function for printing full csl-style bibliographic entries in the middle of an R Markdown document.
#'
#' @param cite_key character vector, a vector of citation keys from a .bib file
#' @param bib_file string, path to .bib file
#' @param csl_file string, name of csl style file, default is apa.csl
#' @param header_level string of hashtags, number of hashtags to set header level, default is "##"
#'
#' @return markdown The markdown to be written into the R Markdown document. Use with results="asis"
#' @export
#'
bib2annotate <- function(cite_key,
                         bib_file,
                         csl_file = "apa.csl",
                         header_level="##"){

  import_bib <- RefManageR::ReadBib(bib_file)
  get_title <- import_bib[[cite_key]]$title
  get_title <- stringr::str_remove_all(get_title,"[{}]")
  single_citation <- RefManageR::toBiblatex(import_bib[[cite_key]])

  cat(c(header_level, " ", get_title, "\n\n"))
  cat(c("::: {.apa}","\n"))
  stevemisc::print_refs(paste(single_citation,collapse=""),csl=csl_file)
  cat(c(":::","\n\n"))
  cat(c("Citation key for ","@",cite_key,": ",cite_key), sep="")

}

