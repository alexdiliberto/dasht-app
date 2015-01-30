import Ember from 'ember';
import _ from 'lodash';

/**
  Live Filtering component

  Filter channels using tags

  @class LiveFilteringComponent
*/
export default Ember.Component.extend({
  /**
    Alias for collection of filters

    @property filters
    @type Class
  */
  filters: Ember.computed.alias('buildFilters'),

  /**
    Alias for categorized groups of filters

    @property filtersGroupGenres
    @type Class
  */
  filtersGroupGenres: Ember.computed.filterBy('filtersArr', 'group', 'genres'),
  /**
    Signal if any of the filters in this group are on

    @property genresFilterOn
    @type Bool
  */
  genresFilterOn: function() {
    return this.get('filtersGroupGenres').isAny('on');
  }.property('filtersArr.@each.on'),
  /**
    Alias for categorized groups of filters

    @property filtersGroupGenres
    @type Class
  */
  filtersGroupAvailability: Ember.computed.filterBy('filtersArr', 'group', 'availablity'),
  /**
    Signal if any of the filters in this group are on

    @property availabilityFilterOn
    @type Bool
  */
  availabilityFilterOn: function() {
    return this.get('filtersGroupAvailability').isAny('on');
  }.property('filtersArr.@each.on'),
  /*
    Allfilters array within filters object

    @property filtersArr
    @type Array
  */
  filtersArr: Ember.computed.alias('filters.allfilters'),

  /**
    Create model for filters collection

    @property buildFilters
    @type Class
  */
  buildFilters: function() {

    var currentContext = this.get('controller').get('model'),
        cachedFilters = currentContext.get('cachedFilters');

    //Breakdown of filters model
    /*
    Filters: {
      allfilters: [
        filter: {
          name: Display name,
          tag: App readable name to compare against channel tags,
          on: Bool signifiy filter/unfilter channel
        }
      ]
    }
    */

    //Template for filters model
    var FiltersModel = Ember.Object.extend({
      init: function() {
        this._super();
        this.set("allfilters", []);
      }
    }),

    _filters = FiltersModel.create();

    //plain old array of filters
    var poarr = [
      //Price
      {
        name: 'Free', tag: 'free', group: 'availablity'
      },
      {
        name: 'Subscription', tag: 'subscription', group: 'availablity'
      },
      {
        name: 'A la carte', tag: 'alacarte', group: 'availablity'
      },
      {
        name: 'Cable Provider', tag: 'cable provider', group: 'availablity'
      },
      {
        name: 'Cast-ready', tag: 'castready', group: 'availablity'
      },
      //Genres
      {
        name: 'Sports', tag: 'sports', group: 'genres'
      },
      {
        name: 'TV', tag: 'tv', group: 'genres'
      },
      {
        name: 'Movies', tag: 'movies', group: 'genres'
      },
      {
        name: 'Music', tag: 'music', group: 'genres'
      },
      {
        name: 'News', tag: 'news', group: 'genres'
      },
    ];

    poarr.filter(function(item) {
      var a = FiltersModel.create();
      a.setProperties({
        name: item.name,
        on: true,
        tag: item.tag,
        group: item.group
      });

      _filters.get("allfilters").push(a);
    });

    //if filters have already been cached, return cached filters
    if(!cachedFilters){
      currentContext.set('cachedFilters', _filters);
      return _filters;
    }else {
      return cachedFilters;
    }


  }.property(),

  /**
    Compare channel's tags with selected filters

    @method applyFilters
  */
  applyFilters: function() {
    var context = this.get('model'),
        model = context.model,
        lib = model.get('library'),
        useFilters = this.get('filters'),
        onFilters = useFilters.allfilters.filterBy('on', true),
        shouldApplyFilters = [];

    //Isolate filters that are turn on into an array
    onFilters.filter(function(item) {
      shouldApplyFilters.push(item.tag);
    });

    //Iterate channels lib, toggle isfiltered property
    lib.setEach('isfiltered', true);
    lib.filter(function(item) {
      //Compare channel tags to filters that are on
      shouldApplyFilters.filter(function(should) {
        //todo: better filtering across filter categories, prioritize by group
        if (_.contains(item.tags, should)) {
          item.toggleProperty('isfiltered');
        }
      });
    });
  },
  actions: {
    /**
      Designate filter on or off

      @method toggleFilter
    */
    toggleFilter: function(filter) {
      var filtersObj = this.get('filters'),
          currentFilter = filtersObj.get('allfilters'),
          foundFilter = currentFilter.findBy('name', filter);

      foundFilter.toggleProperty('on');
      this.applyFilters();
    },

    /**
      Designate entire filter group on or off

      @method toggleFilterGroup
    */
    toggleFiltersGroup: function(group) {
      var filtersGroup = this.get('filtersArr').filterBy('group', group);

      var status = filtersGroup.isAny('on');
      filtersGroup.setEach('on', !status);
      this.applyFilters();
    },

    /**
    Save filter choices in local storage

    @method saveFilters
    */
    saveFilters: function() {
      //to do
    }
  }
});
