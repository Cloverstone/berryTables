if (!!!templates) var templates = {};
templates["table"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"well\" style=\"background:#fff\">");t.b("\n" + i);t.b("	<div class=\"form\"></div>		");t.b("\n" + i);t.b("	<div class=\"paginate-footer\" style=\"overflow:hidden\"></div>");t.b("\n" + i);t.b("	<div class=\"table-responsive\">");t.b("\n" + i);t.b("	<table class=\"table table-bordered table-striped table-hover dataTable\">");t.b("\n" + i);t.b("		<thead>");t.b("\n" + i);t.b("			<tr style=\"background:#fff;cursor:pointer\" class=\"noselect\">");t.b("\n" + i);t.b("				");if(t.s(t.f("items",c,p,1),c,p,0,326,457,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<th data-sort=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\"><h6 style=\"margin: 2px;font-size:13px;white-space: nowrap\"><i class=\"fa fa-sort\"></i> ");t.b(t.v(t.f("label",c,p,0)));t.b("</h6></th>");});c.pop();}t.b("\n" + i);t.b("				<th style=\"width: 100px;\">Actions</th>");t.b("\n" + i);t.b("			</tr>				");t.b("\n" + i);t.b("			<tr style=\"background:#fff;\" class=\"filter\">");t.b("\n" + i);t.b("				");if(t.s(t.f("items",c,p,1),c,p,0,586,631,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<td data-inline=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\" id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\"></td>");});c.pop();}t.b("\n" + i);t.b("				<th><button name=\"reset-search\" class=\"btn btn-warning btn-sm\">Reset</button></th>");t.b("\n" + i);t.b("			</tr>");t.b("\n" + i);t.b("		</thead>");t.b("\n" + i);t.b("		<tbody class=\"list-group\">");t.b("\n" + i);t.b("			<tr><td>");t.b("\n" + i);t.b("				<div class=\"alert alert-info\" role=\"alert\">You have no items.</div>");t.b("\n" + i);t.b("			</td></tr>");t.b("\n" + i);t.b("		</tbody>");t.b("\n" + i);t.b("	</table>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("	<div class=\"paginate-footer\" style=\"overflow:hidden\"></div>");t.b("\n" + i);t.b("<div>");return t.fl(); },partials: {}, subs: {  }});
templates["table_footer"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("	<nav class=\"pull-right\">");t.b("\n" + i);if(t.s(t.f("size",c,p,1),c,p,0,42,751,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<ul class=\"pagination\" style=\"margin:0\">");t.b("\n" + i);t.b("			<li class=\"pagination-first\"><a data-page=\"1\" href=\"javascript:void(0);\" aria-label=\"First\"><span aria-hidden=\"true\">&laquo;</span></a></li>");t.b("\n" + i);t.b("			<li><a data-page=\"dec\" href=\"javascript:void(0);\" aria-label=\"Previous\"><span aria-hidden=\"true\">&lsaquo;</span></a></li>");t.b("\n" + i);if(t.s(t.f("pages",c,p,1),c,p,0,368,468,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("				<li class=\"");t.b(t.v(t.f("active",c,p,0)));t.b("\"><a data-page=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" href=\"javascript:void(0);\">");t.b(t.v(t.f("name",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("			<li><a data-page=\"inc\" href=\"javascript:void(0);\" aria-label=\"Next\"><span aria-hidden=\"true\">&rsaquo;</span></a></li>");t.b("\n" + i);t.b("			<li class=\"pagination-last\"><a data-page=\"\" href=\"javascript:void(0);\" aria-label=\"Last\"><span aria-hidden=\"true\">&raquo;</span></a></li>");t.b("\n");t.b("\n" + i);t.b("		</ul>");t.b("\n" + i);});c.pop();}t.b("	</nav>");t.b("\n" + i);t.b("	<h5 class=\"range\">");if(t.s(t.f("size",c,p,1),c,p,0,797,846,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("Showing ");t.b(t.v(t.f("first",c,p,0)));t.b(" to ");t.b(t.v(t.f("last",c,p,0)));t.b(" of ");t.b(t.v(t.f("size",c,p,0)));t.b(" entries");});c.pop();}if(!t.s(t.f("size",c,p,1),c,p,1,0,0,"")){t.b("No matching entries");};t.b("</h5>");t.b("\n");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});
templates["table_row"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<tr class=\"filterable\">");t.b("\n" + i);if(t.s(t.f("items",c,p,1),c,p,0,35,58,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	<td>");t.b(t.t(t.f("name",c,p,0)));t.b("</td>");t.b("\n" + i);});c.pop();}t.b("	<td style=\"min-width:100px\">");t.b("\n" + i);t.b("		<!-- <div class=\"btn-group\" role=\"group\">");t.b("\n" + i);t.b("			<span class=\"btn btn-xs btn-info\" data-event=\"edit\" href=\"#\">Edit</span>");t.b("\n" + i);t.b("			<span class=\"btn btn-xs btn-danger\" data-event=\"delete\" href=\"#\">Delete</spab>");t.b("\n" + i);t.b("		</div> -->");t.b("\n" + i);t.b("		<!-- Split button -->");t.b("\n" + i);t.b("		<div class=\"btn-group\">");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-xs btn-info go\">Go to</button>");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-xs btn-info dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">");t.b("\n" + i);t.b("		    <span class=\"caret\"></span>");t.b("\n" + i);t.b("		    <span class=\"sr-only\">Toggle Dropdown</span>");t.b("\n" + i);t.b("		  </button>");t.b("\n" + i);t.b("		  <ul class=\"dropdown-menu dropdown-menu-right\">");t.b("\n" + i);t.b("		    <li><a href=\"javascript:void(0);\" data-event=\"edit\"><i class=\"fa fa-pencil\"></i> Edit</a></li>");t.b("\n" + i);t.b("		    <li><a href=\"javascript:void(0);\" data-event=\"delete\"><i class=\"fa fa-times\"></i> Delete</a></li>");t.b("\n" + i);t.b("		  </ul>");t.b("\n" + i);t.b("		</div>");t.b("\n" + i);t.b("	</td>");t.b("\n" + i);t.b("</tr>");return t.fl(); },partials: {}, subs: {  }});