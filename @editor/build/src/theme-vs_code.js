define("ace/theme/vs_code",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
  exports.isDark = true;
  exports.cssClass = "ace-vs-code";
  exports.cssText = ".ace-vs-code .ace_gutter {\
background: #252526;\
color: #c5c8c6;\
}\
.ace-vs-code .ace_print-margin {\
width: 1px;\
background: #25282c;\
}\
.ace-vs-code {\
background-color: #1e1e1e;\
color: #c5c8c6;\
}\
.ace-vs-code .ace_cursor {\
color: #aeafad;\
}\
.ace-vs-code .ace_marker-layer .ace_selection {\
background: #373b41;\
}\
.ace-vs-code.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #1d1f21;\
}\
.ace-vs-code .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0);\
}\
.ace-vs-code .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #4b4e55;\
}\
.ace-vs-code .ace_marker-layer .ace_active-line {\
background: #282a2e;\
}\
.ace-vs-code .ace_gutter-active-line {\
background-color: #282a2e;\
}\
.ace-vs-code .ace_marker-layer .ace_selected-word {\
border: 1px solid #373b41;\
}\
.ace-vs-code .ace_invisible {\
color: #4b4e55;\
}\
.ace-vs-code .ace_keyword,\
.ace-vs-code .ace_meta,\
.ace-vs-code .ace_storage,\
.ace-vs-code .ace_storage.ace_type,\
.ace-vs-code .ace_support.ace_type {\
color: #569cd6;\
}\
.ace-vs-code .ace_keyword.ace_operator {\
color: #8abeb7;\
}\
.ace-vs-code .ace_constant.ace_character,\
.ace-vs-code .ace_constant.ace_language,\
.ace-vs-code .ace_constant.ace_numeric,\
.ace-vs-code .ace_keyword.ace_other.ace_unit,\
.ace-vs-code .ace_support.ace_constant,\
.ace-vs-code .ace_variable.ace_parameter {\
color: #de935f;\
}\
.ace-vs-code .ace_constant.ace_other {\
color: #ced1cf;\
}\
.ace-vs-code .ace_invalid {\
color: #ced2cf;\
background-color: #df5f5f;\
}\
.ace-vs-code .ace_invalid.ace_deprecated {\
color: #ced2cf;\
background-color: #b798bf;\
}\
.ace-vs-code .ace_fold {\
background-color: #81a2be;\
border-color: #c5c8c6;\
}\
.ace-vs-code .ace_entity.ace_name.ace_function,\
.ace-vs-code .ace_support.ace_function,\
.ace-vs-code .ace_variable {\
color: #dcdcaa;\
}\
.ace-vs-code .ace_support.ace_class,\
.ace-vs-code .ace_support.ace_type {\
color: #f0c674;\
}\
.ace-vs-code .ace_heading,\
.ace-vs-code .ace_markup.ace_heading,\
.ace-vs-code .ace_string {\
color: #ce9178;\
}\
.ace-vs-code .ace_entity.ace_name.ace_tag,\
.ace-vs-code .ace_meta.ace_tag,\
.ace-vs-code .ace_string.ace_regexp,\
.ace-vs-code .ace_variable {\
color: #569cd6;\
}\
.ace-vs-code .ace_punctuation.ace_tag-open.ace_xml,\
.ace-vs-code .ace_punctuation.ace_end-tag-open.ace_xml,\
.ace-vs-code .ace_punctuation.ace_tag-close.ace_xml {\
color: #808080;\
}\
.ace-vs-code .ace_entity.ace_attribute-name {\
color: #9cdcfe;\
}\
.ace-vs-code .ace_keyword.ace_operator.ace_attribute-equals.ace_xml {\
color: #d4d4d4;\
}\
.ace-vs-code .ace_string.ace_attribute-value.ace_xml {\
color: #ce9178;\
}\
.ace-vs-code .ace_comment {\
color: #969896;\
}\
.ace-vs-code .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHB3d/8PAAOIAdULw8qMAAAAAElFTkSuQmCC)\
right repeat-y;\
}\
";

  var dom = require("../lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});                (function() {
                    window.require(["ace/theme/vs_code"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            