function berryTable(options) {
	this.draw = function() {
		_.each(this.summary.items, function(item){
			$('.filter #'+item.id+',[data-sort='+item.id+']').toggle(item.isEnabled);
		})
		// summary = this.summary;
		// this.search(_.compactObject(this.filter.toJSON()));
		options.search = _.compactObject(this.filter.toJSON());
		var pagebuffer = options.pagebuffer || 2;

		if(this.$el.find('[name="search"]').val().length){
			this.searchAll(this.$el.find('[name="search"]').val());
		}else{
			this.search(options);
		}


		var renderObj = {};
		options.pagecount = Math.ceil(this.lastGrabbed / options.count);
		renderObj.pages = [];

		if(options.page > options.pagecount){
				options.page = options.pagecount || 1;
		}
		var showing = (this.lastGrabbed>(options.count * options.page))? (options.count * options.page) : this.lastGrabbed;

		var newContainer = $('<tbody class="list-group">');
		_.each(this.grab(options), function(model){
			new viewitem({ 'model': model, container: newContainer, summary:summary});
		});
		var container = this.$el.find('.list-group').empty().replaceWith(newContainer);
		var startpage = options.page - pagebuffer;
		if(startpage < 1){startpage = 1}
		var endpage = options.page + pagebuffer;
		if(endpage >options.pagecount){endpage = options.pagecount}

		for(var i = startpage; i <= endpage; i++){
			var page = {name: i};
			if(options.page == i){
				page.active = 'active';
			}
			renderObj.pages.push(page);
		}
		renderObj.size = this.lastGrabbed;
		renderObj.last = showing;
		renderObj.first = ( (options.count * (options.page-1) ) + 1);

		renderObj.multiPage = (endpage > startpage);
		renderObj.isFirst = (options.page == 1);
		renderObj.isLast = (options.page == options.pagecount);
		renderObj.showLast = (options.pagecount == endpage);
		renderObj.showFirst = (startpage == 1);
		renderObj.checked_count = _.where(this.models, {checked: true}).length;

		renderObj.entries = _.map(options.entries,function(item){
			return {value:item, selected: (item==options.count)}
		},options)

		this.renderObj = renderObj;
		this.$el.find('.paginate-footer').html(templates['table_footer'].render(this.renderObj,templates));
		this.summary.checked_count = _.where(this.models, {checked: true}).length;
		this.summary.multi_checked = (this.summary.checked_count>1);

		this.$el.find('[name="events"]').html(templates['events'].render(this.summary, templates));


		this.fixStyle();

	}

	var changePage = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if($(e.currentTarget).data('page') == 'inc') {
			options.page++;
			if(options.page > options.pagecount){options.page = options.pagecount}

		}else if($(e.currentTarget).data('page') == 'dec') {
			options.page--;
			if(options.page < 1){options.page = 1}
		}else{
			options.page = $(e.currentTarget).data('page') || options.pagecount;
		}
		this.draw();
	}
	var changeSort = function(e) {
		e.stopPropagation();
		e.preventDefault();
		$(e.currentTarget).siblings('[data-sort]').removeClass('text-primary');
		$(e.currentTarget).siblings('[data-sort]').find('i').attr('class', 'fa fa-sort text-muted');
		$(e.currentTarget).addClass('text-primary');
		var sort = _.findWhere(this.options.filterFields, {name: $(e.currentTarget).data('sort')}).search;
		if(options.sort == sort) {
			options.reverse = !options.reverse;
		}else{
			options.reverse = false;
		}
		if(options.reverse) {
			$(e.currentTarget).find('i').attr('class', 'fa fa-sort-asc');
		}else{
			$(e.currentTarget).find('i').attr('class', 'fa fa-sort-desc');
		}
		options.sort = sort;
		this.draw();
	}

	var options = $.extend({count: options.count || 25, page: 1, sort: 'createdAt', reverse: false}, options);

	options.schema = _.map(_.map(options.schema, Berry.processOpts), function(item){
		item.value = item.value || item.default;
		delete item.default;
		return item;
	});
	if(typeof options.filters !== 'undefined'){
		options.filters = _.map(options.filters, Berry.processOpts)
	}
	options.filterFields = _.map($.extend(true, {}, options.filters || options.schema), function(val){
		val = Berry.normalizeItem(val);
		name = val.name;
		switch(val.type){
			case 'textarea':
			case 'contenteditable':
			case 'ace':
			case 'color':
			case 'date':
				val.type = 'text';
				break;
			case 'checkbox':
				val.choices = [{label: val.falsestate || 'False', value: val.falsestate || 'false'}, {label: val.truestate || 'True', value: val.truestate || 'True'}];
			case 'radio':
				val.type = 'select';
			case 'select':
				val.default = {label: 'No Filter', value: ''};
				val.value = '';
				break;
			default:
		}
		if(val.options){
			val.options = _.map(val.options, function(item){
				return _.omit(item, 'selected');
			})
		}
		val.id = val.id || Berry.getUID();
		val.search = val.name;
		val.name = val.id;
		val.show = {};
		// val.isEnabled = true;
		val.enabled = true;
		return val;
	});
	if(typeof options.columns == 'object'){
			options.filterFields = _.filter(options.filterFields, function(item){
					return (_.contains(options.columns, item.name) || _.contains(options.columns,item.id))
			})
	}

	var summary = {'start':'{{', 'end':'}}',checked_count:0,multi_checked:false,'items': _.map(options.filterFields, function(val){
		var name = (val.search|| val.label.split(' ').join('_').toLowerCase());

		if(val.template){
			name = val.template.replace(/{{value}}/gi, '{{attributes.'+ name + '}}');

		}else{
			switch(val.type){
				case 'date':
					name = '<span data-moment="{{attributes.'+name+'}}" data-format="L"></span>'
					break;
				case 'select':
						if(options.inlineEdit){
							name = '<span data-popins="'+name+'"></span>';
						}else{
							name = '{{attributes.'+ name + '}}'
						}
					break;
				case 'color':
					name = '<div class="btn btn-default" style="background-color:{{attributes.'+name+'}}">{{attributes.'+name+'}}</div> {{attributes.'+name+'}}'
					break;
				default:
					name = '{{attributes.'+ name + '}}'
			}
		}
		return {'isEnabled': (typeof val.showColumn =='undefined' || val.showColumn), 'label': val.label, 'name': name, 'cname': (val.name|| val.label.split(' ').join('_').toLowerCase()), 'id': val.id, 'visible':!(val.type == 'hidden')} 
	})};
	options.hasActions = !!(options.edit || options.delete || options.events);
	options.hasEdit = !!(options.edit);
	options.hasDelete = !!(options.delete);
	options.entries = options.entries || [25, 50 ,100];
	// options.hasActions = !!(options.edit || options.delete);
	summary.options = options;
	summary.showAdd = !!(options.add);



	this.defaults = {};
	// summary.enabled = [];
	_.map(options.filterFields, function(val){
		switch(val.type){
			case 'text':
				val.value = '';
				break;
			case 'checkbox':
				val.value = 'false';
			case 'radio':
				val.value = '';
			case 'select':
				val.value = '';
				break;
			default:
		}
		// summary.enabled.push({
		// 	name:val.name,
		// 	label:val.label,
		// 	isEnabled:true
		// })
		this.defaults[val.name] = val.value;
	}.bind(this));
	this.summary = summary;
	var template = Hogan.compile(templates['table'].render(summary, templates));


	function render(){
		return template.render();
	}
	var silentPopulate = function(attributes,fields) {this.each(function(attributes) {if(!this.isContainer) {this.setValue(Berry.search(attributes, this.getPath()));}}, [attributes], this.fields);}

	function onload($el){
		this.$el = $el;

		this.$el.on('click', '#columnEnables label', function(e){
			e.stopPropagation();
			_.findWhere(this.summary.items, {id:e.currentTarget.dataset.field}).isEnabled = e.currentTarget.childNodes[0].checked;
			// $('.filter #'+e.currentTarget.dataset.field+',[data-sort='+e.currentTarget.dataset.field+']').toggle(e.currentTarget.childNodes[0].checked);
			this.draw();

		}.bind(this));

		this.$el.on('click', '[data-event="delete"]', function(e){
				$(e.target).closest('.dropdown-menu').toggle()
				// var index =_.indexOf(_.pluck(this.models, 'id'), e.currentTarget.dataset.id);
				var model = _.findWhere(this.models, {id:e.currentTarget.dataset.id});
				if(confirm("Are you sure you want to delete? \nThis operation can not be undone.\n\n"+ _.values(model.attributes).join('\n') )){
		
					if(typeof this.options.delete == 'function'){
						this.options.delete(model);
					}
								// this.models.splice(index,1);
								model.delete();
								this.draw();
				}
		}.bind(this));

		this.$el.on('click', '[data-event="delete_all"]', function(e){
			  var checked_models = _.where(this.models, {checked: true})
				// var index =_.indexOf(_.pluck(this.models, 'id'), e.currentTarget.dataset.id);
				if (checked_models.length) {
					if(confirm("Are you sure you want to delete "+checked_models.length+" records? \nThis operation can not be undone.\n\n" )){
						_.each(checked_models, function(item){
							if(typeof this.options.delete == 'function'){
								this.options.delete(item);
							}
								item.delete();
						}.bind(this))

						this.draw();
					}	
				}

		}.bind(this));

		this.$el.on('click','[data-event].custom-event-all', $.proxy(function(e){
			e.stopPropagation();
			var event = _.findWhere(this.options.events, {name:e.target.dataset.event})
			if(typeof event !== 'undefined' && typeof event.callback == 'function'){
				event.callback(_.where(this.models, {checked: true})[0]);
			}
		},this));

		this.$el.on('click','[data-event="edit_all"]', $.proxy(function(e){
			e.stopPropagation();

			$().berry($.extend(true,{},{name:'modal', legend: '<i class="fa fa-pencil-square-o"></i> Edit', model: _.where(this.models, {checked: true})[0]}, this.options.berry || {} ) ).on('saved', function() {
				if(typeof this.options.edit == 'function'){
					this.options.edit(_.where(this.models, {checked: true})[0]);
				}
				this.draw();
				//else if(typeof this.model.owner.options.edit == 'string' && typeof  == 'function' ){
				    
				//}
				// this.update();
			}, this)
		},this));


		this.$el.on('change', '[name="count"]', function(e){
			// 		$.extend(options, this.berry.toJSON());
						options.count = parseInt($(e.currentTarget).val(),10);
						this.draw();

		}.bind(this))

		this.$el.on('input', '[name="search"]', _.debounce(function(e){
			this.draw();
		}.bind(this), 300));
		this.$el.on('click', '[data-event="select_all"]', function(e){
			  var checked_models = _.where(this.models, {checked: true})
				// var index =_.indexOf(_.pluck(this.models, 'id'), e.currentTarget.dataset.id);
				if (checked_models.length) {
					// if(confirm("Are you sure you want to delete "+checked_models.length+" records? \nThis operation can not be undone.\n\n" )){
					// 	_.each(checked_models, function(item){
					// 		if(typeof this.options.delete == 'function'){
					// 			this.options.delete(item);
					// 		}
					// 			item.delete();
					// 	}.bind(this))

					// 	this.draw();
					// }	

						
					_.each(checked_models, function(item){item.checked = false;})	

					this.draw();							
					this.$el.find('[data-event="select_all"].fa').attr('class', 'fa fa-fw fa-2x fa-square-o');

				}else{
					_.each(this.filtered, function(item){item.checked = true;})					
					this.draw();

					if(this.summary.checked_count == this.models.length){
						this.$el.find('[data-event="select_all"].fa').attr('class', 'fa fa-fw fa-2x fa-check-square-o');
					}else{
						this.$el.find('[data-event="select_all"].fa').attr('class', 'fa fa-fw fa-2x fa-minus-square-o');
					}



					// this.$el.find('[data-event="select_all"].fa').attr('class', 'fa fa-fw fa-2x fa-check-square-o');
				}


						// if(this.summary.checked_count == this.models.length){
						// 	checkbox.attr('class', 'fa fa-2x fa-fw fa-check-square-o');
						// }else if(this.summary.checked_count == 0){
						// 	checkbox.attr('class', 'fa fa-2x fa-fw fa-square-o');
						// }else{
						// 	checkbox.attr('class', 'fa fa-2x fa-fw fa-minus-square-o');
						// }



		}.bind(this));
		// if($el.find('.form').length){
		// 	this.berry = $el.find('.form').berry({attributes: options,inline:true, actions: false, fields: [
		// 			{label:'Entries per page', name:'count', type: 'select',default:{label: 'All', value: 10000}, options: options.entries || [25, 50 ,100] , columns: 2},
		// 			// {label:false,name:"reset",type:'raw',value:'',columns: 2},
		// 			// {label: 'Search', name:'filter', columns: 5, offset: 1, pre: '<i class="fa fa-search"></i>'}
		// 			// {label:false,name:"create",type:'raw',value:'<button data-event="add" class="btn btn-success pull-right btn-sm" style="margin-top: 30px;"><i class="fa fa-pencil-square-o"></i> Create New</button>',columns: 2,offset:6,show:!!(options.add)},
		// 		]}).on('change:count', function(){
		// 		$.extend(options, this.berry.toJSON());
		// 		options.count = parseInt(options.count,10);
		// 		this.draw();
		// 	}, this);
		// }


		if($el.find('.filter').length){

			this.filter = $el.find('.filter').berry({name:'filter',renderer: 'inline', attributes: this.defaults ,disableMath: true, suppress: true, fields: options.filterFields }).on('change', function(){
				this.$el.find('[name="search"]').val('');
				this.draw();
			}, this);
		}



		if(options.data) {
			for(var i in options.data) {
				this.models.push(new tableModel(this, options.data[i]).on('check', function(){
						this.summary.checked_count = _.where(this.models, {checked: true}).length;
						this.summary.multi_checked = (this.summary.checked_count>1);

						//this.$el.find('.paginate-footer').html(templates['table_footer'].render(this.renderObj,templates));
						this.$el.find('[name="events"]').html(templates['events'].render(this.summary, templates));


						var checkbox = this.$el.find('[data-event="select_all"].fa');
						if(this.summary.checked_count == this.models.length){
							checkbox.attr('class', 'fa fa-2x fa-fw fa-check-square-o');
						}else if(this.summary.checked_count == 0){
							checkbox.attr('class', 'fa fa-2x fa-fw fa-square-o');
						}else{
							checkbox.attr('class', 'fa fa-2x fa-fw fa-minus-square-o');
						}

					}.bind(this))
				);
			}
		}
		// this.collection.on('add', $.proxy(function(record) {
		// 		new viewitem({ 'model': record , container: this.$el.find('.list-group'),summary: summary});
		// 		this.draw();
			// }, this));
		

		this.$el.on('click','[data-page]', changePage.bind(this));
		this.$el.on('click','[data-sort]', changeSort.bind(this));
		this.$el.on('click','[name="reset-search"]', function(){
			this.$el.find('[name="search"]').val('');
			options.sort = null;
			this.$el.find('[data-sort]').removeClass('text-primary');
			this.$el.find('[data-sort]').find('i').attr('class', 'fa fa-sort text-muted');
			silentPopulate.call(this.filter, this.defaults)
			this.draw();
		}.bind(this));
		this.$el.on('click','[name="bt-download"]', function(){
			this.getCSV();
		}.bind(this));
		this.$el.find('[data-event="add"]').on('click', $.proxy(function(){
			$().berry($.extend(true,{},{name:'modal', legend: '<i class="fa fa-pencil-square-o"></i> Create New', fields: options.schema}, options.berry || {} )).on('save', function() {
				if(Berries.modal.validate()){
						var newModel = new tableModel(this, Berries.modal.toJSON());
						this.models.push(newModel);
						Berries.modal.trigger('saved');
						this.draw();
						
						if(typeof this.options.add == 'function'){
								this.options.add(newModel);
							}
				}
			}, this)
		},this));
		this.draw();

	}
	this.add = function(item){
		var newModel = new tableModel(this, item);
		this.models.push(newModel);
		this.draw();
		
		if(typeof this.options.add == 'function'){
			this.options.add(newModel);
		}
	}
	this.search = function(options) {
		var ordered = _.sortBy(this.models, function(obj) { return obj.attributes[options.sort]; });
		if(!options.reverse){
			ordered = ordered.reverse();
		}
		filterMap = this.filterMap;
		ordered = _.filter(ordered, function(anyModel) {

			var keep = $.isEmptyObject(options.search);
			for(var filter in options.search) {
					var temp;
					if(typeof _.where(options.filterFields, {id:filter})[0].options == 'undefined') {
						temp = ($.score((anyModel.attributes[this.filterMap[filter]]+'').replace(/\s+/g, " ").toLowerCase(), (options.search[filter]+'').toLowerCase() ) > 0.40);
					}else{
						temp = (anyModel.attributes[this.filterMap[filter]]+'' == options.search[filter]+'')
					}
					keep = temp;
					if(!keep){break;}
			}
			
			return keep;
		})
		this.lastGrabbed = ordered.length;
		this.filtered = ordered;
	}

	this.searchAll = function(search) {

		//reset sorts and filters
		options.sort = null;
		this.$el.find('[data-sort]').removeClass('text-primary');
		this.$el.find('[data-sort]').find('i').attr('class', 'fa fa-sort text-muted');
		silentPopulate.call(this.filter, this.defaults)


		search = search.toLowerCase()
		//score each model searching each field and finding a total 
		_.map(this.models, function(model){
			model.score = 0;
			for(var filter in options.filterFields) {
				model.score += $.score((model.attributes[options.filterFields[filter].search]+'').replace(/\s+/g, " ").toLowerCase(), search);
			}
		})

		//sort by score (highet first) and remove models with no score
		this.filtered = _.filter(_.sortBy(this.models, 'score'), function(model) {
				return (model.score > 0);
		}).reverse();

		this.lastGrabbed = this.filtered.length;
	}

	this.fixStyle = function(){
		if(this.options.autoSize){
		try{
		this.$el.find('.table-container > div').css('width', 'auto') 
		this.$el.find('.table-container > div').css('minWidth', 'auto') 
		this.$el.find('.table-container > div').css('height', $(window).height() - $('.table-container > div').offset().top - (88+ this.options.autoSize) +'px');
		_.each(	this.$el.find('.list-group tr:first td'), function(item, index){
			this.$el.find('.table-container > table tr th:visible')[index].style.width = item.offsetWidth+'px';
			this.$el.find('.table-container > table tr th:visible')[index].style.minWidth = item.offsetWidth+'px';

		}.bind(this))

		this.$el.find('.table-container > div').css('width', this.$el.find('.table-container > div table')[0].offsetWidth + 'px') 
		this.$el.find('.table-container > div').css('minWidth', this.$el.find('.table-container > div table')[0].offsetWidth + 'px') 
				}catch(e){}
	}	
	}

	this.grab = function(options) {
		return this.filtered.slice((options.count * (options.page-1) ), (options.count * (options.page-1) ) + options.count)
	};
	this.models = [];

	this.options = options;
	this.filterMap = {}
	_.map(options.filterFields, function(item){
			this.filterMap[item.id] = item.search ;
	}.bind(this));
	
	var fields = {
		Title: {},
		Feed: {type: 'select', label_key: 'title', value_key: '_id', required: true, default: {title: 'Current Collection', _id: 'collection'}},
	}
	$(options.container).html(render.call(this));
	onload.call(this, $(options.container));
	this.getCSV = function(title){

		this.filterMap
csvify(
		_.map(this.filtered, function(item){return item.attributes}),
		_.map(
		_.filter(this.summary.items,function(item){return item.isEnabled}) ,function(item){
		return {label:item.label,name:this.filterMap[item.cname]} 

	}),
		title || this.options.title 
)
//		csvify(_.map(this.filtered, function(item){return item.attributes}),_.pluck(this.options.schema, 'name'), title || this.options.title )
	}

	this.$el.find('[name="search"]').focus();

		this.$el.find('.table-container > div').css('overflow', 'auto');

		// $('.table-container > table tbody tr th')[1].style.width = $('.list-group tr:first td')[1].offsetWidth+'px'


// this.$el.find('.table-container > table tr th').resizable() 


		$(window).on('resize orientationChange', this.fixStyle.bind(this));


}
_.mixin({
  compactObject: function(o) {
    _.each(o, function(v, k) {
      if(!v && (v !== 0)) {
        delete o[k];
      }
    });
    return o;
  }
});


(function($) {
  $.score = function(base, abbr, offset) {
    
    //offset = offset || 0 // TODO: I think this is unused... remove
    
    if(abbr.length === 0) return 0.9;
    if(abbr.length > base.length) return 0.0;
    
    for (var i = abbr.length; i > 0; i--) {
      var sub_abbr = abbr.substring(0,i);
      var index = base.indexOf(sub_abbr);
      
      if(index < 0) continue;
      if(index + abbr.length > base.length + offset) continue;
      
      var next_string = base.substring(index+sub_abbr.length);
      var next_abbr = null;
      
      if(i >= abbr.length)
        next_abbr = '';
      else
        next_abbr = abbr.substring(i);
      
      // Changed to fit new (jQuery) format (JSK)
      var remaining_score   = $.score(next_string, next_abbr,offset+index);
      
      if (remaining_score > 0) {
        var score = base.length-next_string.length;
        
        if(index !== 0) {
          //var j = 0;
          
          var c = base.charCodeAt(index-1);
          if(c==32 || c == 9) {
            for(var j=(index-2); j >= 0; j--) {
              c = base.charCodeAt(j);
              score -= ((c == 32 || c == 9) ? 1 : 0.15);
            }
          } else {
            score -= index;
          }
        }
        
        score += remaining_score * next_string.length;
        score /= base.length;
        return score;
      }
    }
    return 0.0;
  };
})(jQuery);


csvify = function(data, columns, title){

  var csv = '"'+_.pluck(columns,'label').join('","')+'"\n';
  this.labels = _.pluck(columns,'name')
  csv += _.map(data,function(d){
      return JSON.stringify(_.values(_.pick(d,this.labels)))
  },this)
  .join('\n') 
  .replace(/(^\[)|(\]$)/mg, '')

  var link = document.createElement("a");
  link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  link.setAttribute("download", (title||"berryTable")+".csv");
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link); 
}

function tableModel (owner, initial) {
	this.owner = owner;
	this.id = Berry.getUID();
	this.attributes = {};
	this.schema = owner.options.schema;
	this.set = function(newAtts){
		this.attributes = newAtts;
	}
	this.checked = false;
	$.extend(true, this.attributes, initial);
	this.toJSON = function() {return this.attributes}
	this.delete = function(){
		this.owner.models.splice(_.indexOf(_.pluck(this.owner.models, 'id'), this.id),1);
	}
	
	this.events = {initialize: []};
	this.addSub = Berry.prototype.addSub;
	this.on = Berry.prototype.on;
	this.off = Berry.prototype.off;
	this.trigger = Berry.prototype.trigger;

};

// tableModel.prototype.events = {initialize: []};
// tableModel.prototype.addSub = Berry.prototype.addSub;
// tableModel.prototype.on = Berry.prototype.on;
// tableModel.prototype.off = Berry.prototype.off;
// tableModel.prototype.trigger = Berry.prototype.trigger;

function viewitem(options){

	this.update = function() {
		if(typeof this.berry !== 'undefined'){this.berry.destroy();}

		this.$el.find('[data-event]').off();
		this.$el.off();
		this.$el.replaceWith(this.setElement(this.view.render(this.model , templates)).$el);

		if(this.$el.find('[data-popins]').length > 0){
			this.berry = this.$el.berry({ popins: {container: '#first', viewport:{ selector: 'body', padding: 20 }}, renderer: 'popins', model: this.model});
		}

		if(typeof this.model.owner.options.click == 'function'){
			this.$el.on('click',function(e){
				if(typeof e.target.dataset.event ==  'undefined'){
					this.model.owner.options.click(this.model);
				}
			}.bind(this))
		}
		// var temp = [];
		// this.$el.find('[data-event]').each(function(){
		// 	temp.push($(this).data('event'));
		// })


		this.$el.find('[data-event].custom-event').on('click', $.proxy(function(e){
			e.stopPropagation();
			$(e.target).closest('.dropdown-menu').toggle()
			var event = _.findWhere(this.model.owner.options.events, {name:e.target.dataset.event})
			if(typeof event !== 'undefined' && typeof event.callback == 'function'){
				// this.model.owner.options.edit(this.model);
				event.callback(this.model);
			}
		},this));



		this.$el.find(".btn-group > .dropdown-toggle").on('click',function(e) {
		    e.stopPropagation();
		    $(this).next('.dropdown-menu').toggle();
		})

		// this.$el.find('[data-event="delete"]')
		this.$el.find('[data-event="edit"]').on('click', $.proxy(function(e){
			e.stopPropagation();
			$(e.target).closest('.dropdown-menu').toggle()
			$().berry($.extend(true,{},{name:'modal', legend: '<i class="fa fa-pencil-square-o"></i> Edit', model: this.model}, this.model.owner.options.berry || {} ) ).on('saved', function() {
				if(typeof this.model.owner.options.edit == 'function'){
					this.model.owner.options.edit(this.model);
				}
				//else if(typeof this.model.owner.options.edit == 'string' && typeof  == 'function' ){
				    
				//}
				this.update();
			}, this)
		},this));
		this.$el.find('[data-event="mark"]').on('click', $.proxy(function(e){
			e.stopPropagation();
			this.model.checked = e.currentTarget.checked;
			this.model.trigger('check');
		},this));

		// this.$el.find("abbr.timeago").timeago();
		this.$el.find("[data-moment]").each(function(item){
			$(this).html(moment.utc($(this).data('moment')).format($(this).data('format')) );
		});
		this.$el.find(".sparkline").each(function(){
			$(this).peity($(this).data('type'), {radius: $(this).data('radius')});
		});
	}
	this.view = Hogan.compile(templates['table_row'].render(options.summary, templates));

	this.setElement = function(html){
		this.$el = $(html);
		return this;
	}


	this.model = options.model;
	this.$el  = $('<tr>');
	if(options.container){
		options.container.append(this.$el);
	}

	this.model.on('change', this.update, this);
	this.model.on('destroy', $.proxy(function(){
		this.$el.fadeOut('fast', $.proxy(function() {
			this.remove();
		}, this));
	}, this) );
	this.update();

}

if (!!!templates) var templates = {};
templates["events"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);if(t.s(t.d("options.hasDelete",c,p,1),c,p,0,29,323,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	<!-- <div data-event=\"add\" class=\"btn btn-success\"><i class=\"fa fa-pencil-square-o\"></i> New</div> -->");t.b("\n" + i);t.b("	<a href=\"javascript:void(0);\" data-event=\"delete_all\" class=\"btn btn-danger ");if(!t.s(t.f("checked_count",c,p,1),c,p,1,0,0,"")){t.b("disabled");};t.b("\" style=\"margin-right:15px\"><i class=\"fa fa-times\"></i> Delete</a>");t.b("\n" + i);});c.pop();}t.b("	<div class=\"btn-group\"role=\"group\" aria-label=\"...\">");t.b("\n");t.b("\n" + i);t.b("	    ");if(t.s(t.d("options.hasEdit",c,p,1),c,p,0,426,657,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<a href=\"javascript:void(0);\" data-event=\"edit_all\" class=\"btn btn-primary ");if(!t.s(t.f("checked_count",c,p,1),c,p,1,0,0,"")){t.b("disabled");};if(t.s(t.f("multi_checked",c,p,1),c,p,0,563,571,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("disabled");});c.pop();}t.b("\" data-id=\"");t.b(t.v(t.f("start",c,p,0)));t.b("id");t.b(t.v(t.f("end",c,p,0)));t.b("\"><i class=\"fa fa-pencil\"></i> Edit</a>");});c.pop();}t.b("\n");t.b("\n" + i);if(t.s(t.d("options.events",c,p,1),c,p,0,703,942,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	    	<a href=\"javascript:void(0);\" data-event=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" class=\"custom-event-all btn btn-default ");if(!t.s(t.f("checked_count",c,p,1),c,p,1,0,0,"")){t.b("disabled");};if(t.s(t.f("multi_checked",c,p,1),c,p,0,864,872,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("disabled");});c.pop();}t.b("\" data-id=\"");t.b(t.v(t.f("start",c,p,0)));t.b("id");t.b(t.v(t.f("end",c,p,0)));t.b("\">");t.b(t.t(t.f("label",c,p,0)));t.b("</a>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("	</div>");t.b("\n" + i);t.b("		");if(t.s(t.f("checked_count",c,p,1),c,p,0,991,1102,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<h5 class=\"range badge alert-info checked_count\" style=\"margin:0 15px;\">");t.b(t.v(t.f("checked_count",c,p,0)));t.b(" item(s) selected</h5>");});c.pop();}t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});
templates["table"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"well\" style=\"background:#fff\">");t.b("\n" + i);t.b("	<div style=\"height:40px\">");t.b("\n");t.b("\n");t.b("\n" + i);t.b("		<div class=\"btn-group pull-right\" style=\"margin-bottom:10px\" role=\"group\" aria-label=\"...\">");t.b("\n" + i);if(t.s(t.f("showAdd",c,p,1),c,p,0,181,282,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("			<div data-event=\"add\" class=\"btn btn-success\"><i class=\"fa fa-pencil-square-o\"></i> New</div>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("			<div class=\"btn btn-default\" name=\"bt-download\"><i class=\"fa fa-download\"></i></div>");t.b("\n");t.b("\n" + i);t.b("			<div name=\"reset-search\" class=\"btn btn-default\">");t.b("\n" + i);t.b("				<i class=\"fa fa-filter\"></i>");t.b("\n" + i);t.b("				<i class=\"fa fa-times text-danger\" style=\"position: absolute;right: 5px;\"></i>");t.b("\n" + i);t.b("			</div>");t.b("\n" + i);t.b("			<div class=\"btn-group\" id=\"columnEnables\">");t.b("\n" + i);t.b("			  <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">");t.b("\n" + i);t.b("			    <i class=\"fa fa-list\"></i>");t.b("\n" + i);t.b("			    <span class=\"caret\"></span>");t.b("\n" + i);t.b("			  </button>");t.b("\n" + i);t.b("			  <ul class=\"dropdown-menu pull-right\" style=\"padding-top:10px\" aria-labelledby=\"dropdownMenu1\">");t.b("\n" + i);if(t.s(t.f("items",c,p,1),c,p,0,962,1208,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("visible",c,p,1),c,p,0,981,1188,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("			    <li><label data-field=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" style=\"width:100%;font-weight:normal\"><input type=\"checkbox\" ");if(t.s(t.f("isEnabled",c,p,1),c,p,0,1095,1112,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("checked=\"checked\"");});c.pop();}t.b(" style=\"margin: 5px 0 5px 15px;\"> ");t.b(t.v(t.f("label",c,p,0)));t.b("</label></li>");t.b("\n" + i);});c.pop();}});c.pop();}t.b("			  </ul>");t.b("\n" + i);t.b("			</div>");t.b("\n" + i);t.b("		</div>");t.b("\n");t.b("\n" + i);t.b("		<div name=\"events\" class=\" pull-left\" style=\"margin-bottom:10px\" >");t.b("\n");t.b("\n" + i);t.b("		</div>");t.b("\n");t.b("\n" + i);t.b("		<!-- <div class=\"input-group pull-right\" style=\"max-width:300px; margin-right:15px\"> -->");t.b("\n" + i);t.b("				<input type=\"text\" name=\"search\" class=\"form-control pull-right\" style=\"max-width:300px; margin-right:15px\" placeholder=\"Search\">");t.b("\n" + i);t.b("				<!-- <span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span> -->");t.b("\n");t.b("\n" + i);t.b("		<!-- </div> -->");t.b("\n" + i);t.b("	</div>	");t.b("\n" + i);t.b("	<!-- <div class=\"paginate-footer\" style=\"overflow:hidden\"></div> -->");t.b("\n" + i);t.b("	<div class=\"table-container\" style=\"width:100%;overflow:auto\">");t.b("\n" + i);if(t.s(t.d("options.autoSize",c,p,1),c,p,0,1821,2523,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);t.b("		<table class=\"table table-bordered\" style=\"margin-bottom:0px\">");t.b("\n");t.b("\n" + i);t.b("			<thead>");t.b("\n" + i);t.b("			<tr style=\"background:#fff;cursor:pointer\" class=\"noselect\">");t.b("\n" + i);t.b("				<th style=\"width: 60px;min-width:60px;\"></th>");t.b("\n");t.b("\n" + i);t.b("				");if(t.s(t.f("items",c,p,1),c,p,0,2029,2195,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("visible",c,p,1),c,p,0,2041,2183,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<th data-sort=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\"><h6 style=\"margin: 2px;font-size:13px;white-space: nowrap\"><i class=\"fa fa-sort text-muted\"></i> ");t.b(t.v(t.f("label",c,p,0)));t.b("</h6></th>");});c.pop();}});c.pop();}t.b("\n");t.b("\n" + i);t.b("			</tr>				");t.b("\n" + i);t.b("			<tr style=\"background:#fff;\" class=\"filter\">");t.b("\n");t.b("\n" + i);t.b("				<th>");t.b("\n" + i);t.b("											 <i data-event=\"select_all\" class=\"fa fa-fw fa-2x fa-square-o\"></i>");t.b("\n");t.b("\n" + i);t.b("				</th>				");t.b("\n" + i);t.b("		");if(t.s(t.f("items",c,p,1),c,p,0,2384,2476,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("visible",c,p,1),c,p,0,2396,2464,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<td data-inline=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\" style=\"min-width:85px\" id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\"></td>");});c.pop();}});c.pop();}t.b("\n");t.b("\n" + i);t.b("			</tr>");t.b("\n" + i);t.b("		</thead>");t.b("\n" + i);t.b("		</table>");t.b("\n" + i);});c.pop();}t.b("\n");t.b("\n" + i);t.b("<div style=\"min-height:100px\">");t.b("\n" + i);t.b("	<table class=\"table table-bordered table-striped table-hover dataTable\" style=\"margin-bottom:0px\">");t.b("\n" + i);if(!t.s(t.d("options.autoSize",c,p,1),c,p,1,0,0,"")){t.b("					<thead>");t.b("\n" + i);t.b("			<tr style=\"background:#fff;cursor:pointer\" class=\"noselect\">");t.b("\n" + i);t.b("				<th style=\"width: 60px;min-width:60px;\"></th>");t.b("\n");t.b("\n" + i);t.b("				");if(t.s(t.f("items",c,p,1),c,p,0,2844,3038,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("visible",c,p,1),c,p,0,2856,3026,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isEnabled",c,p,1),c,p,0,2870,3012,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<th data-sort=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\"><h6 style=\"margin: 2px;font-size:13px;white-space: nowrap\"><i class=\"fa fa-sort text-muted\"></i> ");t.b(t.v(t.f("label",c,p,0)));t.b("</h6></th>");});c.pop();}});c.pop();}});c.pop();}t.b("\n");t.b("\n" + i);t.b("			</tr>				");t.b("\n" + i);t.b("			<tr style=\"background:#fff;\" class=\"filter\">");t.b("\n" + i);t.b("				<th><div class=\"btn-group\">");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-sm btn-default go\" data-event=\"select_all\"> <i class=\"fa fa-lg fa-fw fa-square-o\"></i></button>");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-sm btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">");t.b("\n" + i);t.b("		    <span class=\"caret\"></span>");t.b("\n" + i);t.b("		    <span class=\"sr-only\">Toggle Dropdown</span>");t.b("\n" + i);t.b("		  </button>");t.b("\n" + i);t.b("		  <ul class=\"dropdown-menu\">");t.b("\n" + i);t.b("		    ");if(t.s(t.d("options.hasDelete",c,p,1),c,p,0,3578,3679,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li><a href=\"javascript:void(0);\" data-event=\"delete_all\"><i class=\"fa fa-times\"></i> Delete</a></li>");});c.pop();}t.b("\n" + i);t.b("		  </ul>");t.b("\n" + i);t.b("		</div></th>				");t.b("\n" + i);t.b("		");if(t.s(t.f("items",c,p,1),c,p,0,3742,3862,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("visible",c,p,1),c,p,0,3754,3850,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isEnabled",c,p,1),c,p,0,3768,3836,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<td data-inline=\"");t.b(t.v(t.f("cname",c,p,0)));t.b("\" style=\"min-width:85px\" id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\"></td>");});c.pop();}});c.pop();}});c.pop();}t.b("\n");t.b("\n" + i);t.b("			</tr>");t.b("\n" + i);t.b("		</thead>");t.b("\n" + i);};t.b("\n" + i);t.b("		<tbody class=\"list-group\">");t.b("\n" + i);t.b("			<tr><td>");t.b("\n" + i);t.b("				<div class=\"alert alert-info\" role=\"alert\">You have no items.</div>");t.b("\n" + i);t.b("			</td></tr>");t.b("\n" + i);t.b("		</tbody>");t.b("\n");t.b("\n" + i);t.b("	</table>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("	<div class=\"paginate-footer\" style=\"overflow:hidden;margin-top:10px\"></div>");t.b("\n" + i);t.b("<div>");return t.fl(); },partials: {}, subs: {  }});
templates["table_footer"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);if(t.s(t.f("multiPage",c,p,1),c,p,0,21,930,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	<nav class=\"pull-right\" style=\"margin-left: 10px;\">");t.b("\n" + i);if(t.s(t.f("size",c,p,1),c,p,0,85,910,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<ul class=\"pagination\" style=\"margin:0\">");t.b("\n" + i);if(!t.s(t.f("isFirst",c,p,1),c,p,1,0,0,"")){t.b("			");if(!t.s(t.f("showFirst",c,p,1),c,p,1,0,0,"")){t.b("<li class=\"pagination-first\"><a data-page=\"1\" href=\"javascript:void(0);\" aria-label=\"First\"><span aria-hidden=\"true\">&laquo;</span></a></li>");};t.b("\n" + i);t.b("			<li><a data-page=\"dec\" href=\"javascript:void(0);\" aria-label=\"Previous\"><span aria-hidden=\"true\">&lsaquo;</span></a></li>");t.b("\n" + i);};if(t.s(t.f("pages",c,p,1),c,p,0,471,571,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("				<li class=\"");t.b(t.v(t.f("active",c,p,0)));t.b("\"><a data-page=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" href=\"javascript:void(0);\">");t.b(t.v(t.f("name",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("isLast",c,p,1),c,p,1,0,0,"")){t.b("			<li><a data-page=\"inc\" href=\"javascript:void(0);\" aria-label=\"Next\"><span aria-hidden=\"true\">&rsaquo;</span></a></li>");t.b("\n" + i);t.b("			");if(!t.s(t.f("showLast",c,p,1),c,p,1,0,0,"")){t.b("<li class=\"pagination-last\"><a data-page=\"\" href=\"javascript:void(0);\" aria-label=\"Last\"><span aria-hidden=\"true\">&raquo;</span></a></li>");};t.b("\n" + i);};t.b("\n" + i);t.b("		</ul>");t.b("\n" + i);});c.pop();}t.b("	</nav>");t.b("\n");t.b("\n" + i);});c.pop();}t.b("	<h5 class=\"range badge ");if(!t.s(t.f("size",c,p,1),c,p,1,0,0,"")){t.b("alert-danger");};t.b(" pull-left\" style=\"margin-right:15px;\">");if(t.s(t.f("size",c,p,1),c,p,0,1048,1097,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("Showing ");t.b(t.v(t.f("first",c,p,0)));t.b(" to ");t.b(t.v(t.f("last",c,p,0)));t.b(" of ");t.b(t.v(t.f("size",c,p,0)));t.b(" results");});c.pop();}if(!t.s(t.f("size",c,p,1),c,p,1,0,0,"")){t.b("No matching results");};t.b("</h5>");t.b("\n");t.b("\n" + i);t.b("		<span class=\"pull-left\">");t.b("\n" + i);t.b("			<select class=\"form-control\" style=\"display:inline-block;width:auto;min-width:50px\" name=\"count\">");t.b("\n" + i);t.b("			<option value=\"10000\">All</option>");t.b("\n" + i);if(t.s(t.f("entries",c,p,1),c,p,0,1331,1429,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("			<option value=\"");t.b(t.v(t.f("value",c,p,0)));t.b("\" ");if(t.s(t.f("selected",c,p,1),c,p,0,1374,1393,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("selected=\"selected\"");});c.pop();}t.b(">");t.b(t.v(t.f("value",c,p,0)));t.b("</option>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("			</select>");t.b("\n" + i);t.b("			results per page");t.b("\n" + i);t.b("		</span>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});
templates["table_row"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<tr class=\"filterable\">");t.b("\n" + i);t.b("	<td style=\"width: 60px;min-width:60px;\">");t.b("\n" + i);if(t.s(t.d("options.hasActions",c,p,1),c,p,0,91,1028,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<!-- 		<div class=\"btn-group\">");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-xs btn-info go\">Actions</button>");t.b("\n" + i);t.b("		  <button type=\"button\" class=\"btn btn-xs btn-info dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">");t.b("\n" + i);t.b("		    <span class=\"caret\"></span>");t.b("\n" + i);t.b("		    <span class=\"sr-only\">Toggle Dropdown</span>");t.b("\n" + i);t.b("		  </button>");t.b("\n" + i);t.b("		  <ul class=\"dropdown-menu dropdown-menu-right\">");t.b("\n" + i);t.b("		    ");if(t.s(t.d("options.hasEdit",c,p,1),c,p,0,510,633,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li><a href=\"javascript:void(0);\" data-event=\"edit\" data-id=\"");t.b(t.v(t.f("start",c,p,0)));t.b("id");t.b(t.v(t.f("end",c,p,0)));t.b("\"><i class=\"fa fa-pencil\"></i> Edit</a></li>");});c.pop();}t.b("\n" + i);t.b("		    ");if(t.s(t.d("options.hasDelete",c,p,1),c,p,0,682,808,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li><a href=\"javascript:void(0);\" data-event=\"delete\" data-id=\"");t.b(t.v(t.f("start",c,p,0)));t.b("id");t.b(t.v(t.f("end",c,p,0)));t.b("\"><i class=\"fa fa-times\"></i> Delete</a></li>");});c.pop();}t.b("\n" + i);t.b("		  </ul>");t.b("\n" + i);t.b("		</div> -->");t.b("\n" + i);t.b("		<input type=\"checkbox\" ");t.b(t.v(t.f("start",c,p,0)));t.b("#checked");t.b(t.v(t.f("end",c,p,0)));t.b("checked=\"checked\"");t.b(t.v(t.f("start",c,p,0)));t.b("/checked");t.b(t.v(t.f("end",c,p,0)));t.b(" data-event=\"mark\" style=\"margin: 0 8px 0 4px;\">&nbsp;<div class=\"btn-group\">");t.b("\n" + i);t.b("   ");t.b("\n" + i);});c.pop();}t.b("	</td>");t.b("\n" + i);if(t.s(t.f("items",c,p,1),c,p,0,1070,1168,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	");if(t.s(t.f("visible",c,p,1),c,p,0,1084,1154,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isEnabled",c,p,1),c,p,0,1098,1140,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<td style=\"min-width:85px\">");t.b(t.t(t.f("name",c,p,0)));t.b("</td>");});c.pop();}});c.pop();}t.b("\n" + i);});c.pop();}t.b("</tr>");return t.fl(); },partials: {}, subs: {  }});
