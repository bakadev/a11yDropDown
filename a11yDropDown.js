;(function($){
	var A11yDropDown = function(ele,option){
		this.ele = ele;
		this.$ele = $(ele);
		this.$menu = $(this.$ele.attr('href'));
		this.position = this.$ele.data('position') == 'right' ? 'right' : 'left';
		this.offsetEle = this.$ele.data('offset-element');
		this.offsetPx = this.$ele.data('offset-pixel');
		this.autoHide = this.$ele.data('autohide') == false ? false : true;
		var that = this;

		this.menuVisible = function() {
			return that.$menu.is(':visible');
		};
		this.option = option;
	};

	A11yDropDown.prototype = {
		init: function() {
			var that = this,
				option = this.option;

			if(this[option]){
				this[option].call(this);
				return this;
			}
			
			this.$ele.off('.a11yDropDown').on({
				'click.a11yDropDown' : function(e){
					e.preventDefault();
					e.stopPropagation();
				},
				'mousedown.a11yDropDown' : function(e){
					e.stopImmediatePropagation();
					if (!that.menuVisible()){
						that.showMenu.call(that);
					} else if (that.menuVisible() && !that.autoHide){
						that.hideMenu.call(that);
					}
				},
				'mouseleave.a11yDropDown' : function(){
					if (that.menuVisible() && that.autoHide){
						that.hideMenu.call(that);
					}
				},
				'mouseenter.a11yDropDown' : function(){
					if (that.menuVisible() && that.$ele.hasClass('active')){
						clearTimeout(A11yDropDown.menuTimeout);
					}
				},
				'keydown.a11yDropDown' : function(e){
					var keys = {enter:13, esc:27, tab:9, left:37, up:38, right:39, down:40, spacebar:32};
					switch(e.keyCode) {
						case keys.enter:
							e.preventDefault();
							if (!that.menuVisible()){
								that.showMenu.call(that);
							}
							break;
						case keys.esc:
							if (that.menuVisible()){
								that.hideMenu.call(that,false);
							}
							break;
						case keys.tab:
							that.$ele.removeClass('active').trigger('actionLinkHide');
							that.hideMenu.call(that,false);
							break;
						case keys.down:
							e.preventDefault();
							if (that.menuVisible()){
								that.$menu.find('a:first').focus();
							} else {
								that.showMenu.call(that);
							}
							break;
						case keys.up:
							e.preventDefault();
							if (that.menuVisible()){
								that.hideMenu.call(that,false);
							}
							break;
						default:
							break;
					}
				},
				'focusin.a11yDropDown' : function(){
					that.showMenu.call(that);
				}
			}).attr({
				'role' : 'button',
				'aria-haspopup' : 'true',
				'tabindex' : '0',
				'aria-owns' : that.$menu.attr('id')
			});
			this.$menu.attr({
				'aria-hidden' : 'true',
				'role' : 'menu',
				'aria-expanded' : 'false'
			}).find('li').attr('role', 'menuitem').find('a').attr('tabindex', -1);

			return this;
		},
		getPosition : function(){
			var leftPos = 0,
				$parentEle = this.$ele,
				offsetBy = 0;

			if (typeof this.offsetEle !== 'undefined'){
				$parentEle = $('#'+this.offsetEle);
			}

			if (typeof this.offsetPx !== 'undefined'){
				offsetBy = this.offsetPx;
			}

			if(this.position === 'left'){
				leftPos = $parentEle.offset().left;
			} else {
				leftPos = $parentEle.offset().left + $parentEle.outerWidth() - this.$menu.outerWidth();
			}

			return {
				top : $parentEle.offset().top + $parentEle.outerHeight(),
				left : leftPos + offsetBy
			};
		},
		showMenu : function(){
			var that = this;
			var menuPos = this.getPosition();

			this.$ele.addClass('active').trigger('actionLinkShow');
			this.$menu.stop(true,true).css({
				top : menuPos.top,
				left : menuPos.left
			});

			if(!that.autoHide){
				$('body').off('.a11yDropDown').on('click.a11yDropDown', function(e){
					if (!$(e.target).hasClass('.a11yDropMenu') || !$(e.target).hasClass('.a11yDropDown') ){
						that.hideMenu.call(that);
					}
				});
			}

			if (this.menuVisible()) {
				clearTimeout(A11yDropDown.menuTimeout);
			} else {
				this.$menu.attr({
					'aria-hidden' : 'false',
					'aria-expanded' : 'true'
				}).fadeIn('fast').off('.a11yDropDown').on({
					'mouseenter.a11yDropDown': function(){
						if (that.menuVisible()){
							clearTimeout(A11yDropDown.menuTimeout);
						}
					},
					'focusin.a11yDropDown': function(){
						if (that.menuVisible()){
							clearTimeout(A11yDropDown.menuTimeout);
						}
					},
					'mouseleave.a11yDropDown' : function(){
						if(that.autoHide){
							that.hideMenu.call(that);
						}
					},
					'click.a11yDropDown' : function(e){
						e.stopPropagation();
					}
				}).find('a').on({
					'keydown.a11yDropDown' : function(e){
						var keys = {enter:13, esc:27, tab:9, left:37, up:38, right:39, down:40, spacebar:32},
							$this = $(this),
							$aCollection = that.$menu.find('a');
						switch(e.keyCode) {
							case keys.esc:
							case keys.tab:
								$this.blur();
								that.$ele.focus();
								that.hideMenu.call(that,false);
								break;
							case keys.down:
								e.preventDefault();
								$aCollection.each(function(i, a){
									if (i === $aCollection.length-1){
										return false;
									} else {
										if ($(a).is(':focus')){
											$this.blur();
											$aCollection.eq(i+1).focus();
											return false;
										}
									}
								});
								break;
							case keys.up:
								e.preventDefault();
								$aCollection.each(function(i, a){
									if ($(a).is(':focus')){
										if (i === 0){
											$this.blur();
											that.$ele.focus();
										} else {
											$this.blur();
											$aCollection.eq(i-1).focus();
											return false;
										}
									}
								});
								break;
							default:
								break;
						}
					},
					'click.a11yDropDown' : $.proxy(this.hideMenu, this)
				});
			}
		},
		hideMenu : function(delay){
			var that = this;
			delay = (delay !== false) ? true : false;

			function hideThis(){
				that.$ele.removeClass('active').trigger('actionLinkHide');
				that.$menu.attr({
					'aria-hidden' : 'true',
					'aria-expanded' : 'false'
				}).stop(true,true).fadeOut('fast').find('a').off('.a11yDropDown');
			}
			if (that.menuVisible() && delay){
				A11yDropDown.menuTimeout = setTimeout(function(){
					hideThis();
				}, 200);
			} else if (that.menuVisible() && !delay){
				hideThis();
			}
			if(!that.autoHide){
				$('body').off('.a11yDropDown');
			}
		},
		destroy : function(){
			this.$ele.off('.a11yDropDown');
			this.$menu.find('li').removeAttr('role').find('a').off('.a11yDropDown').attr('tabindex', 0);
		}
	};

	$.fn.a11yDropDown = function(option) {
		return this.each(function() {
			new A11yDropDown(this, option).init();
		});
	};

	if($('.a11yDropDown').length){
		$('.a11yDropDown').a11yDropDown();
	}
}(jQuery));