//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// [OT] Modifications done:
//
// * Replace UMD with csui AMD at the top and bottom of the file
// * Use noConflict

// [OT] Declare a csui module
 csui.define('csui/lib/underscore',['module', 'csui/lib/underscore.string', 'csui/lib/underscore.deepExtend'
 ], function(module, _s, _deepExtend) {
  'use strict';

  // Baseline setup
  // --------------

  // [OT] Only web browser environment is supported
  var root = typeof window !== 'undefined' ? window : {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-parameter case has been omitted only because no current consumers
      // made use of it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
  // This accumulates the arguments passed into an array, after a given index.
  var restArgs = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0);
      var rest = Array(length);
      for (var index = 0; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArgs(function(obj, method, args) {
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArgs(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArgs(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArgs(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArgs(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Split an **array** into several arrays containing **count** or less elements
  // of initial array.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];

    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArgs(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArgs(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArgs(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArgs(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArgs(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArgs(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArgs = restArgs;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArgs(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArgs(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, prop, fallback) {
    var value = object == null ? void 0 : object[prop];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // [OT] Merge the string extensions into the _ root
  // Guard against cyclic dependency. Unfortunately, this module was
  // initially loaded from csui/lib/underscore, while it should be
  // referenced from modules, which use it in their sources.
  if (_s) {
    _.string = _.str = _s;
  }

  // [OT] Merge the deepExtend extension into the _ root
  // Guard against cyclic dependency. Unfortunately, this module was
  // initially loaded from csui/lib/underscore, while it should be
  // referenced from modules, which use it in their sources.
  if (_deepExtend) {
    _.deepExtend = _deepExtend;
  }

  // [OT] Do not leave traces in the global scope
  return _.noConflict();

});

/*
 * css.normalize.js
 *
 * CSS Normalization
 *
 * CSS paths are normalized based on an optional basePath and the RequireJS config
 *
 * Usage:
 *   normalize(css, fromBasePath, toBasePath);
 *
 * css: the stylesheet content to normalize
 * fromBasePath: the absolute base path of the css relative to any root (but without ../ backtracking)
 * toBasePath: the absolute new base path of the css relative to the same root
 * 
 * Absolute dependencies are left untouched.
 *
 * Urls in the CSS are picked up by regular expressions.
 * These will catch all statements of the form:
 *
 * url(*)
 * url('*')
 * url("*")
 * 
 * @import '*'
 * @import "*"
 *
 * (and so also @import url(*) variations)
 *
 * For urls needing normalization
 *
 */

csui.define('csui/lib/normalize',[],function() {
  
  // regular expression for removing double slashes
  // eg http://www.example.com//my///url/here -> http://www.example.com/my/url/here
  var slashes = /([^:])\/+/g
  var removeDoubleSlashes = function(uri) {
    return uri.replace(slashes, '$1/');
  }

  // given a relative URI, and two absolute base URIs, convert it from one base to another
  var protocolRegEx = /[^\:\/]*:\/\/([^\/])*/;
  var absUrlRegEx = /^(\/|data:)/;
  function convertURIBase(uri, fromBase, toBase) {
    if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
      return uri;
    uri = removeDoubleSlashes(uri);
    // if toBase specifies a protocol path, ensure this is the same protocol as fromBase, if not
    // use absolute path at fromBase
    var toBaseProtocol = toBase.match(protocolRegEx);
    var fromBaseProtocol = fromBase.match(protocolRegEx);
    if (fromBaseProtocol && (!toBaseProtocol || toBaseProtocol[1] != fromBaseProtocol[1] || toBaseProtocol[2] != fromBaseProtocol[2]))
      return absoluteURI(uri, fromBase);
    
    else {
      return relativeURI(absoluteURI(uri, fromBase), toBase);
    }
  };
  
  // given a relative URI, calculate the absolute URI
  function absoluteURI(uri, base) {
    if (uri.substr(0, 2) == './')
      uri = uri.substr(2);

    // absolute urls are left in tact
    if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
      return uri;
    
    var baseParts = base.split('/');
    var uriParts = uri.split('/');
    
    baseParts.pop();
    
    while (curPart = uriParts.shift())
      if (curPart == '..')
        baseParts.pop();
      else
        baseParts.push(curPart);
    
    return baseParts.join('/');
  };


  // given an absolute URI, calculate the relative URI
  function relativeURI(uri, base) {
    
    // reduce base and uri strings to just their difference string
    var baseParts = base.split('/');
    baseParts.pop();
    base = baseParts.join('/') + '/';
    i = 0;
    while (base.substr(i, 1) == uri.substr(i, 1))
      i++;
    while (base.substr(i, 1) != '/')
      i--;
    base = base.substr(i + 1);
    uri = uri.substr(i + 1);

    // each base folder difference is thus a backtrack
    baseParts = base.split('/');
    var uriParts = uri.split('/');
    out = '';
    while (baseParts.shift())
      out += '../';
    
    // finally add uri parts
    while (curPart = uriParts.shift())
      out += curPart + '/';
    
    return out.substr(0, out.length - 1);
  };
  
  var normalizeCSS = function(source, fromBase, toBase) {

    fromBase = removeDoubleSlashes(fromBase);
    toBase = removeDoubleSlashes(toBase);

    var urlRegEx = /@import\s*("([^"]*)"|'([^']*)')|url\s*\((?!#)\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/ig;
    var result, url, source;

    while (result = urlRegEx.exec(source)) {
      url = result[3] || result[2] || result[5] || result[6] || result[4];
      var newUrl;
      newUrl = convertURIBase(url, fromBase, toBase);
      var quoteLen = result[5] || result[6] ? 1 : 0;
      source = source.substr(0, urlRegEx.lastIndex - url.length - quoteLen - 1) + newUrl + source.substr(urlRegEx.lastIndex - quoteLen - 1);
      urlRegEx.lastIndex = urlRegEx.lastIndex + (newUrl.length - url.length);
    }
    
    return source;
  };
  
  normalizeCSS.convertURIBase = convertURIBase;
  normalizeCSS.absoluteURI = absoluteURI;
  normalizeCSS.relativeURI = relativeURI;
  
  return normalizeCSS;
});
;
/*
 * Require-CSS RequireJS css! loader plugin
 * 0.1.8
 * Guy Bedford 2014
 * MIT
 */

/*
 *
 * Usage:
 *  require(['css!./mycssFile']);
 *
 * Tested and working in (up to latest versions as of March 2013):
 * Android
 * iOS 6
 * IE 6 - 10
 * Chome 3 - 26
 * Firefox 3.5 - 19
 * Opera 10 - 12
 * 
 * browserling.com used for virtual testing environment
 *
 * Credit to B Cavalier & J Hann for the IE 6 - 9 method,
 * refined with help from Martin Cermak
 * 
 * Sources that helped along the way:
 * - https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
 * - http://www.phpied.com/when-is-a-stylesheet-really-loaded/
 * - https://github.com/cujojs/curl/blob/master/src/curl/plugin/css.js
 *
 */

csui.define('css',['i18n'], function(i18n) {
  if (typeof window == 'undefined')
    return { load: function(n, r, load){ load() } };

  var head = document.getElementsByTagName('head')[0];
  var linkWithCustomThemeFlag = head.querySelector('link[data-csui-use-custom-theme]');
  var linkWithThemeOverridesFlag = head.querySelector('link[data-csui-theme-overrides]') ||
                                   head.querySelector('style[data-csui-theme-overrides]');

  if (linkWithCustomThemeFlag) {
    console.warn('The attribute "data-csui-use-custom-theme" has been deprecated.  ' +
                 'Instead of creating a theme for all modules in single directory, ' +
                 ' use styling overrides with the attribute "data-csui-theme-overrides".');
  }

  var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;

  // use <style> @import load method (IE < 9, Firefox < 18)
  var useImportLoad = false;
  
  // set to false for explicit <link> load checking when onload doesn't work perfectly (webkit)
  var useOnload = true;

  // trident / msie
  if (engine[1] || engine[7])
    useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
  // webkit
  else if (engine[2] || engine[8])
    useOnload = false;
  // gecko
  else if (engine[4])
    useImportLoad = parseInt(engine[4]) < 18;

  //main api object
  var cssAPI = {};

  cssAPI.pluginBuilder = 'csui/lib/css-builder';

  // <style> @import load method
  var curStyle, curSheet;
  var createStyle = function () {
    curStyle = document.createElement('style');
    curStyle.setAttribute('data-csui-required', 'true');
    if (linkWithThemeOverridesFlag) {
      head.insertBefore(curStyle, linkWithThemeOverridesFlag);
    } else {
      head.appendChild(curStyle);
    }
    curSheet = curStyle.styleSheet || curStyle.sheet;
  }
  var ieCnt = 0;
  var ieLoads = [];
  var ieCurCallback;
  
  var createIeLoad = function(url) {
    curSheet.addImport(url);
    curStyle.onload = function(){ processIeLoad() };
    
    ieCnt++;
    if (ieCnt == 31) {
      createStyle();
      ieCnt = 0;
    }
  }
  var processIeLoad = function() {
    ieCurCallback();
 
    var nextLoad = ieLoads.shift();
 
    if (!nextLoad) {
      ieCurCallback = null;
      return;
    }
 
    ieCurCallback = nextLoad[1];
    createIeLoad(nextLoad[0]);
  }
  var importLoad = function(url, callback) {
    if (!curSheet || !curSheet.addImport)
      createStyle();

    if (curSheet && curSheet.addImport) {
      // old IE
      if (ieCurCallback) {
        ieLoads.push([url, callback]);
      }
      else {
        createIeLoad(url);
        ieCurCallback = callback;
      }
    }
    else {
      // old Firefox
      curStyle.textContent = '@import "' + url + '";';

      var loadInterval = setInterval(function() {
        try {
          curStyle.sheet.cssRules;
          clearInterval(loadInterval);
          callback();
        } catch(e) {}
      }, 10);
    }
  }

  // <link> load method
  var linkLoad = function(url, callback) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.setAttribute('data-csui-required', 'true');
    if (useOnload)
      link.onload = function() {
        link.onload = function() {};
        // for style dimensions queries, a short delay can still be necessary
        setTimeout(callback, 7);
      }
    else
      var loadInterval = setInterval(function() {
        for (var i = 0; i < document.styleSheets.length; i++) {
          var sheet = document.styleSheets[i];
          if (sheet.href == link.href) {
            clearInterval(loadInterval);
            return callback();
          }
        }
      }, 10);
    link.href = url;
    if (linkWithThemeOverridesFlag) {
      head.insertBefore(link, linkWithThemeOverridesFlag);
    } else {
      head.appendChild(link);
    }
  }

  cssAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 4, 4) == '.css')
      name = name.substr(0, name.length - 4);

    return normalize(name);
  }

  cssAPI.load = function(cssId, req, load, config) {

    (useImportLoad ? importLoad : linkLoad)(req.toUrl(cssId + '.css'), load);

  }

  // Enable loading separate stylesheets for module bundles:
  //   // Append this to the module bundle built by r.js
  //   require(['require', 'css'], function (require, css) {
  //     css.styleLoad(require, '<module bundle name built by r.js>');
  //   });
  cssAPI.styleLoad = function (require, moduleName, moduleLevelRTLEnabled) {
    var cssFilePostfix = i18n.settings.rtl && moduleLevelRTLEnabled ? '-rtl.css' : '.css',
        styleSheetUrl,
        moduleUrl = require.toUrl(moduleName),
        urlQueryIndex = moduleUrl.indexOf('?');
    // TODO: Remove support for data-csui-theme-overrides as soon as we decide.
    if (linkWithCustomThemeFlag) {
      styleSheetUrl = linkWithCustomThemeFlag.getAttribute('href');
      var slashIndex = styleSheetUrl.lastIndexOf('/');
      styleSheetUrl = (slashIndex < 0 ? '' : styleSheetUrl.substr(0, slashIndex + 1)) +
                      moduleName + '.css' ;
      if (urlQueryIndex >= 0) {
        styleSheetUrl += moduleUrl.substring(urlQueryIndex);
      }
    } else {
      // Trim URL query which was added by require.toUrl from urlArgs to
      // bust browser cache and add it after the stylesheet extension
      styleSheetUrl = urlQueryIndex < 0 ? moduleUrl + cssFilePostfix :
                      moduleUrl.substring(0, urlQueryIndex) + cssFilePostfix +
                      moduleUrl.substring(urlQueryIndex);
    }
    linkLoad(styleSheetUrl, function () {});
  }

  return cssAPI;
});


csui.define('css!xecmpf/pages/start/perspectivewithoutheader',[],function(){});
  csui.define('xecmpf/pages/start/perspective-only.page.view',['module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone',
  'csui/lib/marionette', 'csui/lib/fastclick', 'csui/utils/namedlocalstorage',
  'csui/utils/contexts/perspective/perspective.context',
  'csui/utils/contexts/factories/connector', 'csui/utils/contexts/factories/user',
  'csui/pages/start/perspective.routing', 'csui/utils/url', 'csui/utils/base',
  'csui/pages/start/impl/perspective.panel/perspective.panel.view',
  'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
  'csui/behaviors/keyboard.navigation/tabables.behavior',
  'csui/utils/page.leaving.blocker',
  'csui/controls/globalmessage/globalmessage',
  'csui/controls/iconpreload/icon.preload.view',
  "css!xecmpf/pages/start/perspectivewithoutheader"
  ], function (module, _, $, Backbone, Marionette, FastClick, NameLocalStorage,
  PerspectiveContext, ConnectorFactory, UserModelFactory, PerspectiveRouting,
  Url, base, PerspectivePanelView, ViewEventsPropagationMixin,
  TabablesBehavior, PageLeavingBlocker, GlobalMessage, IconPreloadView) {

  var config = _.extend({
    signInPageUrl: 'signin.html'
  }, module.config());

  var PerspectiveOnlyPageView = Marionette.ItemView.extend({

    behaviors: {
      TabablesBehavior: {
        behaviorClass: TabablesBehavior
      }
    },

    template: false,

    constructor: function PerspectiveOnlyPageView(options) {
      Marionette.ItemView.prototype.constructor.call(this, options);

      if (!this.options.el) {
        this.setElement(document.body);
      }

      // Create application context for this page
      var context = new PerspectiveContext(),
        connector = context.getObject(ConnectorFactory);

      // SAPRM-9977
      context.options = context.options || {};
      context.options.suppressReferencePanel = true;
      // End of SAPRM-9977

      // Check if the page has authentication information
      // Use Basic Authentication (known credentials)
      if (!connector.connection.credentials &&
        // Use pre-authenticated session (session.ticket)
        !connector.authenticator.isAuthenticated() &&
        // Try pre-authenticated session from session storage
        !connector.authenticator.syncStorage().isAuthenticated()) {
        this._navigateToSignIn();
        return;
      }

      this.perspectivePanel = new PerspectivePanelView({
        context: context
      });
      this.propagateEventsToViews(this.perspectivePanel);

      // Initialize URL routing
      var routing = PerspectiveRouting.getInstance({
        context: context
      });

      // Start the client application URL router
      var historyOptions;
      if (PerspectiveRouting.routesWithSlashes()) {
        historyOptions = {
          pushState: true,
          // Use the URL path cut to the /app, without the rest of the path,
          // which should be handled by the client locally
          root: Url.combine(
            new Url(new Url(location.pathname).getCgiScript()).getPath(),
            '/xecm')
        };
      } else {
        // The current location path is the default root. However, the
        // Backbone.history.atRoot() returns true, only if the root is
        // set explicitly.  Probably a Backbone bug.
        historyOptions = {
          root: location.pathname
        };
      }
      Backbone.history.start(historyOptions);

      // Enable styling workarounds for Safari on iPad.  We might want to
      // put them to a separate CSS file loaded dynamically, instead of
      // having them in the same file identified by this class, if the size
      // of the workaround styles grows too much.
      if (base.isAppleMobile()) {
        this.$el.addClass('csui-on-ipad');
      }

      // Workaround for an iPad quirk for the price of disabling its
      // double-tap features; it waits 300ms before the click event
      // is dispatched and this makes it do it immediately
      FastClick.attach(this.el);

      // Workaround for the back-forward cache in Safari, which ignores the
      // no-store cache control flag and loads the page from cache, when the
      // back button is clicked.  As long as logging out does not invalidate
      // the LLCookie/OTCSTicket and we write the ticket to the /app, going
      // back would allow the logged-out user working with the REST API again.
      //
      // http://madhatted.com/2013/6/16/you-do-not-understand-browser-history
      // http://www.mobify.com/blog/beginners-guide-to-http-cache-headers/
      $(window).unload(function () { });

      this.perspectivePanel.on("show:perspective swap:perspective", function () {
        var parent = window.opener ? window.opener : window !== window.parent ? window.parent : undefined;
        if (parent) {
          if (this.$el.find(".conws-header-wrapper").length === 0) {
			// when full page view is opened from folderbrowse, folderbrowse's origin (integration system) need not necessarily be same as full page view's origin (CS). 
			// So setting the targetOrigin to "*" as we dont have access to the parent origin
            parent.postMessage({ "status": "showDialogHeader" }, "*");
          } else {
			// when full page view is opened from folderbrowse, folderbrowse's origin (integration system) need not necessarily be same as full page view's origin (CS). 
			// So setting the targetOrigin to "*" as we dont have access to the parent origin  
            parent.postMessage({ "status": "hideDialogHeader" }, "*");
          }
        }
      });
    },

    onRender: function () {
      if (!this._redirecting) {
        this.$el.addClass("binf-widgets xecm-page-widget");
        this.$el.append("<div class='binf-widgets'></div>")
        IconPreloadView.ensureOnThePage();
        GlobalMessage.setMessageRegionView(this,
          { classes: "xecm-global-message", useClass: true, sizeToParentContainer: true });
        var perspectiveRegion = new Marionette.Region({ el: this.$el.find("div") });
        perspectiveRegion.show(this.perspectivePanel);
      }
    },

    _navigateToSignIn: function () {
      // The development HTML pages do not use OTDS login page
      if (PerspectiveRouting.routesWithSlashes()) {
        // If the session expires or is not available, reload the /app page;
        // authentication should be performed by the server redirecting to
        // the OTDS login page
        PageLeavingBlocker.forceDisable();
        location.reload();
      } else {
        var signInPageUrl = this.options.signInPageUrl || config.signInPageUrl,
          query = location.search;
        query += query ? '&' : '?';
        query += 'nextUrl=' + encodeURIComponent(location.pathname);
        location.href = signInPageUrl + query + location.hash;
      }
      // The REST of the view rendering continues, until the context
      // is switched, and the page would quickly show its content
      // before the location change finally kicks in.
      this._redirecting = true;
    }

  });

  _.extend(PerspectiveOnlyPageView.prototype, ViewEventsPropagationMixin);

  return PerspectiveOnlyPageView;

});

/**
 * @license i18n 2.0.6 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/i18n/LICENSE
 */
/*jslint regexp: true */
/*global require: false, navigator: false, define: false */

/**
 * This plugin handles i18n! prefixed modules. It does the following:
 *
 * 1) A regular module can have a dependency on an i18n bundle, but the regular
 * module does not want to specify what locale to load. So it just specifies
 * the top-level bundle, like 'i18n!nls/colors'.
 *
 * This plugin will load the i18n bundle at nls/colors, see that it is a root/master
 * bundle since it does not have a locale in its name. It will then try to find
 * the best match locale available in that master bundle, then request all the
 * locale pieces for that best match locale. For instance, if the locale is 'en-us',
 * then the plugin will ask for the 'en-us', 'en' and 'root' bundles to be loaded
 * (but only if they are specified on the master bundle).
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/colors bundle to be that mixed in locale.
 *
 * 2) A regular module specifies a specific locale to load. For instance,
 * i18n!nls/fr-fr/colors. In this case, the plugin needs to load the master bundle
 * first, at nls/colors, then figure out what the best match locale is for fr-fr,
 * since maybe only fr or just root is defined for that locale. Once that best
 * fit is found, all of its locale pieces need to have their bundles loaded.
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/fr-fr/colors bundle to be that mixed in locale.
 */

// [OT] Modifications done:
//
// * Adding :preferred after the requirejs module name will use the highest
//   priority preferred language, adding :configured will use the 'locale'
//   configuration options

+    //:preferred or :configured can be appended to use preferredLocales or locale

(function () {
    'use strict';

    //regexp for reconstructing the master bundle name from parts of the regexp match
    //nlsRegExp.exec('foo/bar/baz/nls/en-ca/foo') gives:
    //['foo/bar/baz/nls/en-ca/foo', 'foo/bar/baz/nls/', '/', '/', 'en-ca', 'foo']
    //nlsRegExp.exec('foo/bar/baz/nls/foo') gives:
    //['foo/bar/baz/nls/foo', 'foo/bar/baz/nls/', '/', '/', 'foo', '']
    //so, if match[5] is blank, it means this is the top bundle definition.
    // [OT] Introduce suffixes to choose configured language
    //:preferred or :configured can be appended to use preferredLocales or locale
    var nlsRegExp = /(^.*(^|\/)nls(\/|$))([^\/:]*)\/?([^\/:]*)(:[^\/:]*)?/;

    //Helper function to avoid repeating code. Lots of arguments in the
    //desire to stay functional and support RequireJS contexts without having
    //to know about the RequireJS contexts.
    function addPart(locale, master, needed, toLoad, prefix, suffix) {
        if (master[locale]) {
            needed.push(locale);
            if (master[locale] === true || master[locale] === 1) {
                toLoad.push(prefix + locale + '/' + suffix);
            }
        }
    }

    function addIfExists(req, locale, toLoad, prefix, suffix) {
        var fullName = prefix + locale + '/' + suffix;
        if (require._fileExists(req.toUrl(fullName + '.js'))) {
            toLoad.push(fullName);
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     * This is not robust in IE for transferring methods that match
     * Object.prototype names, but the uses of mixin here seem unlikely to
     * trigger a problem related to that.
     */
    function mixin(target, source, force) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop) && (!target.hasOwnProperty(prop) || force)) {
                target[prop] = source[prop];
            } else if (typeof source[prop] === 'object') {
                if (!target[prop] && source[prop]) {
                    target[prop] = {};
                }
                mixin(target[prop], source[prop], force);
            }
        }
    }

    csui.define('i18n',['module'], function (module) {
        var masterConfig = module.config ? module.config() : {},
            locale = masterConfig.locale,
            // [OT] Introduce defaultLocale to make the fallback language
            // configurable and change the default from 'root' to English
            defaultLocale = masterConfig.defaultLocale || 'en-us',
            // [OT] Introduce preferredLocales separate from locale. Module
            // suffix can select between those two. preferredLocales can be
            // used also by other plugins for input and output, while locale
            // can stay for display text translation.
            preferredLocales = masterConfig.preferredLocales || [],
            // [OT] Introduce loadableLocales to limit languages, which are
            // tried to load to only those, which are available on the server
            loadableLocales = masterConfig.loadableLocales || [],
            // [OT] Introduce rtl as a setting for other modules, which is
            // beneficial to maintain together with other settings here
            rtl = masterConfig.rtl || false,
            // [OT] Introduce overriding specific strings in specific modules
            // from module/string keys in require.conf objects
            overrides = masterConfig.overrides || {};
        defaultLocale = defaultLocale.toLowerCase();
        if (!locale) {
            locale = typeof navigator !== 'undefined' &&
                     (navigator.languages && navigator.languages[0] ||
                      navigator.language || navigator.userLanguage) ||
                     defaultLocale;
        }
        locale = locale.toLowerCase();
        // [OT] Make an aray of all locales loadable by requirejs
        if (typeof loadableLocales === 'object' && !(loadableLocales instanceof Array)) {
            loadableLocales = Object.keys(loadableLocales);
        }
        var localeIndex, convertedLocale;
        for (localeIndex = 0; localeIndex < loadableLocales.length; ++localeIndex) {
            convertedLocale = loadableLocales[localeIndex];
            if (convertedLocale) {
                loadableLocales[localeIndex] = convertedLocale.toLowerCase();
            }
        }
        // [OT] Convert the string from Accept-Language to a prioritized array
        if (typeof preferredLocales === 'string') {
            // See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
            // See https://tools.ietf.org/html/bcp47
            // Example: "en-GB, sv;q=0.7, en;q=0.9"
            preferredLocales = preferredLocales
                .replace(/\s/g, '')
                .split(',')
                .map(function (item) {
                    var pair = item.split(';'),
                        quality = pair[1] || '';
                    return {
                        locale: pair[0].toLowerCase(),
                        quality: parseFloat(quality.split('=')[1] || 1)
                    };
                })
                // Skip empty items after splitting with ','
                .filter(function (item) {
                    return item.locale;
                })
                .sort(function (left, right) {
                    left = left.quality;
                    right = right.quality;
                    // the other way round - higher quality should be at the front
                    // quality 1 should come before quality 0
                    return left < right ? 1 : left > right ? -1 : 0;
                });
        }
        // [OT] Ensure, that we have at least the configured language as the preference
        if (!preferredLocales.length) {
          preferredLocales[0] = {
              locale: locale,
              quality: 1
          };
        }
        // [OT] Put together all localization settings into a single structure
        // to make the public interface
        var settings = {
            // Specified UI language chosen for the user
            locale: locale,
            // Specifies the default (fallback) language, if user
            // language is not available
            defaultLocale: defaultLocale,
            // Lists UI languages, which are availabel to choose from,
            // as a map, where keys are locales and values is true.
            loadableLocales: loadableLocales,
            // Lists preferred data formatting and sorting locales
            // in the preferred order as an array, where items are
            // objects with properties 'locale' and 'quality'
            preferredLocales: preferredLocales,
            // Specifies whether current language supports RTL or not
            rtl: rtl
        };

        return {
            version: '2.0.6',
            // [OT] FIXME: Remove defaultLocale; it was left here for compatibility
            defaultLocale: locale,
            // [OT] Expose the localization settings for module consumers
            settings: settings,
            /**
             * Called when a dependency needs to be loaded.
             */
            load: function (name, req, onLoad, config) {
                config = config || {};

                var masterName,
                    match = nlsRegExp.exec(name),
                    prefix = match[1],
                    locale = match[4],
                    suffix = match[5],
                    // [OT] Support ':suffix' preferences
                    preference = match[6],
                    parts = locale.split('-'),
                    toLoad = [],
                    value = {},
                    i, part, current = '';

                //If match[5] is blank, it means this is the top bundle definition,
                //so it does not have to be handled. Locale-specific requests
                //will have a match[4] value but no match[5]
                if (match[5]) {
                    //locale-specific bundle
                    prefix = match[1];
                } else {
                    //Top-level bundle.
                    suffix = match[4];
                    // [OT] Let the caller decide between the web browser settings
                    // for data formatting and the locale for translated texts
                    // TODO: Try preferred locales in the preferred order; not just
                    // the highest priority in the preferredLocales array
                    locale = preference === ':preferred' ?
                             settings.preferredLocales[0].locale : settings.locale;
                    parts = locale.split('-');
                }
                masterName = prefix + suffix;

                if (config.isBuild) {
                    //Check for existence of all locale possible files and
                    //require them if exist.
                    toLoad.push(masterName);
                    addIfExists(req, 'root', toLoad, prefix, suffix);
                    for (i = 0; i < parts.length; i++) {
                        part = parts[i];
                        current += (current ? '-' : '') + part;
                        addIfExists(req, current, toLoad, prefix, suffix);
                    }

                    req(toLoad, function () {
                        onLoad();
                    });
                } else {
                    //First, fetch the master bundle, it knows what locales are available.
                    req([masterName], function (master) {
                        //Figure out the best fit
                        var needed = [], unknown = [],
                            part;

                        //Always allow for root, then do the rest of the locale parts.
                        addPart('root', master, needed, toLoad, prefix, suffix);
                        for (i = 0; i < parts.length; i++) {
                            part = parts[i];
                            current += (current ? '-' : '') + part;
                            if (master[current] !== undefined) {
                                addPart(current, master, needed, toLoad,
                                        prefix, suffix);
                            } else {
                                // [OT] Gather the languages, which have not been
                                // specified in the master module
                                unknown.push(current);
                            }
                        }

                        //Load all the parts missing.
                        function loadKnownParts() {
                            req(toLoad, function () {
                                var i, partBundle, partModule, part;
                                for (i = needed.length - 1; i > -1 && needed[i]; i--) {
                                    part = needed[i];
                                    partBundle = master[part];
                                    // [OT] Fill the localization object from custom localization
                                    // strings before loading the localization modules
                                    // Full name of the module with localized strings
                                    partModule = prefix + part + '/' + suffix;
                                    // Merge dynamic localized strings from the configuration, if found
                                    Object.keys(overrides)
                                        .forEach(function (overrideModule) {
                                            if (overrideModule === partModule) {
                                                mixin(value, overrides[overrideModule]);
                                            }
                                        });
                                    // Support localization modules stored outside the master module
                                    if (partBundle === true || partBundle === 1) {
                                        partBundle = req(partModule);
                                    }
                                    // Merge static localized strings from the localizatoin module
                                    mixin(value, partBundle);
                                }

                                //All done, notify the loader.
                                onLoad(value);
                            }, function (error) {
                                // [OT] If a language module fails, propagate the failure
                                // and do not wait for a time-out
                                if (onLoad.error) {
                                    onLoad.error(error);
                                }
                            });
                        }

                        // [OT] Combine loading both known and unknown language modules

                        //Try loading one by one parts not specified in the
                        //master module and when all were processed, load the
                        //known rest and build the requested bundle.
                        function loadUnknownParts() {
                            current = unknown.shift();
                            if (current) {
                                if (settings.loadableLocales.length === 0 ||
                                    settings.loadableLocales.indexOf(current) >= 0) {
                                    req([prefix + current + '/' + suffix],
                                        function () {
                                            needed.push(current);
                                            master[current] = true;
                                            loadUnknownParts();
                                        }, function () {
                                            master[current] = false;
                                            loadUnknownParts();
                                        });
                                } else {
                                    master[current] = false;
                                    loadUnknownParts();
                                }
                            } else {
                                loadKnownParts();
                            }
                        }

                        //If at least one of the fallback locales was specified
                        // in the master module, do not try the unspecified.
                        if (needed.length > 1) {
                            loadKnownParts();
                        } else {
                            loadUnknownParts();
                        }
                    }, function (error) {
                        if (onLoad.error) {
                            onLoad.error(error);
                        }
                    });
                }
            }
        };
    });
}());

csui.define('xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/integration/folderbrowse/impl/nls/root/localized.strings',{
  BackButtonToolItem: "Back",
  PageWidgetToolItem: "Open Full Page Workspace",
  SearchToolItem: "Search From Here",
  SearchFromHerePlaceHolder: "Search From Here",
  CloseToolTip:"Close"
});



csui.define('css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse',[],function(){});
csui.define('xecmpf/widgets/integration/folderbrowse/search.box.view',['module', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/widgets/search.box/search.box.view',
  'i18n!xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',
  "css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse"
], function (module, _, $, SearchBoxView, Lang) {
  "use strict";

  var config = _.defaults({}, module.config(), {
    showOptionsDropDown: false,
    showSearchInput: true,
    searchFromHere: true,
    customSearchIconClass: "xecmpf-icon-search",
    customSearchIconEnabledClass: "xecmpf-icon-search-md",
    placeholder: Lang.SearchFromHerePlaceHolder
  });

  var CustomSearchBoxView = SearchBoxView.extend({
    constructor: function CustomSearchBoxView(options) {
      options = options || {};
      options.data = _.defaults({}, options.data, config);
      SearchBoxView.prototype.constructor.call(this, options);
    },
    //Overriding the searchIconClicked method of SearchBoxView to prevent window beforeunload event
    //of the connector from getting called."beforeunload" method of connector sets a flag which
    //indefinitely shows the blocker in case of error
    searchIconClicked: function (event) {
      event.preventDefault();
      event.stopPropagation();
      SearchBoxView.prototype.searchIconClicked.call(this, event);
    }
  });

  return CustomSearchBoxView;

});

/*!

 handlebars v3.0.3

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof csui.define === 'function' && csui.define.amd)
		csui.define('csui/lib/handlebars',factory);
	else if(typeof exports === 'object')
		exports["Handlebars"] = factory();
	else
		root["Handlebars"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;

	var _runtime = __webpack_require__(1);

	var _runtime2 = _interopRequireWildcard(_runtime);

	// Compiler imports

	var _AST = __webpack_require__(2);

	var _AST2 = _interopRequireWildcard(_AST);

	var _Parser$parse = __webpack_require__(3);

	var _Compiler$compile$precompile = __webpack_require__(4);

	var _JavaScriptCompiler = __webpack_require__(5);

	var _JavaScriptCompiler2 = _interopRequireWildcard(_JavaScriptCompiler);

	var _Visitor = __webpack_require__(6);

	var _Visitor2 = _interopRequireWildcard(_Visitor);

	var _noConflict = __webpack_require__(7);

	var _noConflict2 = _interopRequireWildcard(_noConflict);

	var _create = _runtime2['default'].create;
	function create() {
	  var hb = _create();

	  hb.compile = function (input, options) {
	    return _Compiler$compile$precompile.compile(input, options, hb);
	  };
	  hb.precompile = function (input, options) {
	    return _Compiler$compile$precompile.precompile(input, options, hb);
	  };

	  hb.AST = _AST2['default'];
	  hb.Compiler = _Compiler$compile$precompile.Compiler;
	  hb.JavaScriptCompiler = _JavaScriptCompiler2['default'];
	  hb.Parser = _Parser$parse.parser;
	  hb.parse = _Parser$parse.parse;

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_noConflict2['default'](inst);

	inst.Visitor = _Visitor2['default'];

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;

	var _import = __webpack_require__(9);

	var base = _interopRequireWildcard(_import);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)

	var _SafeString = __webpack_require__(10);

	var _SafeString2 = _interopRequireWildcard(_SafeString);

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var _import2 = __webpack_require__(12);

	var Utils = _interopRequireWildcard(_import2);

	var _import3 = __webpack_require__(13);

	var runtime = _interopRequireWildcard(_import3);

	var _noConflict = __webpack_require__(7);

	var _noConflict2 = _interopRequireWildcard(_noConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = _SafeString2['default'];
	  hb.Exception = _Exception2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime;
	  hb.template = function (spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_noConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	var AST = {
	  Program: function Program(statements, blockParams, strip, locInfo) {
	    this.loc = locInfo;
	    this.type = 'Program';
	    this.body = statements;

	    this.blockParams = blockParams;
	    this.strip = strip;
	  },

	  MustacheStatement: function MustacheStatement(path, params, hash, escaped, strip, locInfo) {
	    this.loc = locInfo;
	    this.type = 'MustacheStatement';

	    this.path = path;
	    this.params = params || [];
	    this.hash = hash;
	    this.escaped = escaped;

	    this.strip = strip;
	  },

	  BlockStatement: function BlockStatement(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
	    this.loc = locInfo;
	    this.type = 'BlockStatement';

	    this.path = path;
	    this.params = params || [];
	    this.hash = hash;
	    this.program = program;
	    this.inverse = inverse;

	    this.openStrip = openStrip;
	    this.inverseStrip = inverseStrip;
	    this.closeStrip = closeStrip;
	  },

	  PartialStatement: function PartialStatement(name, params, hash, strip, locInfo) {
	    this.loc = locInfo;
	    this.type = 'PartialStatement';

	    this.name = name;
	    this.params = params || [];
	    this.hash = hash;

	    this.indent = '';
	    this.strip = strip;
	  },

	  ContentStatement: function ContentStatement(string, locInfo) {
	    this.loc = locInfo;
	    this.type = 'ContentStatement';
	    this.original = this.value = string;
	  },

	  CommentStatement: function CommentStatement(comment, strip, locInfo) {
	    this.loc = locInfo;
	    this.type = 'CommentStatement';
	    this.value = comment;

	    this.strip = strip;
	  },

	  SubExpression: function SubExpression(path, params, hash, locInfo) {
	    this.loc = locInfo;

	    this.type = 'SubExpression';
	    this.path = path;
	    this.params = params || [];
	    this.hash = hash;
	  },

	  PathExpression: function PathExpression(data, depth, parts, original, locInfo) {
	    this.loc = locInfo;
	    this.type = 'PathExpression';

	    this.data = data;
	    this.original = original;
	    this.parts = parts;
	    this.depth = depth;
	  },

	  StringLiteral: function StringLiteral(string, locInfo) {
	    this.loc = locInfo;
	    this.type = 'StringLiteral';
	    this.original = this.value = string;
	  },

	  NumberLiteral: function NumberLiteral(number, locInfo) {
	    this.loc = locInfo;
	    this.type = 'NumberLiteral';
	    this.original = this.value = Number(number);
	  },

	  BooleanLiteral: function BooleanLiteral(bool, locInfo) {
	    this.loc = locInfo;
	    this.type = 'BooleanLiteral';
	    this.original = this.value = bool === 'true';
	  },

	  UndefinedLiteral: function UndefinedLiteral(locInfo) {
	    this.loc = locInfo;
	    this.type = 'UndefinedLiteral';
	    this.original = this.value = undefined;
	  },

	  NullLiteral: function NullLiteral(locInfo) {
	    this.loc = locInfo;
	    this.type = 'NullLiteral';
	    this.original = this.value = null;
	  },

	  Hash: function Hash(pairs, locInfo) {
	    this.loc = locInfo;
	    this.type = 'Hash';
	    this.pairs = pairs;
	  },
	  HashPair: function HashPair(key, value, locInfo) {
	    this.loc = locInfo;
	    this.type = 'HashPair';
	    this.key = key;
	    this.value = value;
	  },

	  // Public API used to evaluate derived attributes regarding AST nodes
	  helpers: {
	    // a mustache is definitely a helper if:
	    // * it is an eligible helper, and
	    // * it has at least one parameter or hash segment
	    helperExpression: function helperExpression(node) {
	      return !!(node.type === 'SubExpression' || node.params.length || node.hash);
	    },

	    scopedId: function scopedId(path) {
	      return /^\.|this\b/.test(path.original);
	    },

	    // an ID is simple if it only has one part, and that part is not
	    // `..` or `this`.
	    simpleId: function simpleId(path) {
	      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
	    }
	  }
	};

	// Must be exported as an object rather than the root of the module as the jison lexer
	// must modify the object to operate properly.
	exports['default'] = AST;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;
	exports.parse = parse;

	var _parser = __webpack_require__(14);

	var _parser2 = _interopRequireWildcard(_parser);

	var _AST = __webpack_require__(2);

	var _AST2 = _interopRequireWildcard(_AST);

	var _WhitespaceControl = __webpack_require__(15);

	var _WhitespaceControl2 = _interopRequireWildcard(_WhitespaceControl);

	var _import = __webpack_require__(16);

	var Helpers = _interopRequireWildcard(_import);

	var _extend = __webpack_require__(12);

	exports.parser = _parser2['default'];

	var yy = {};
	_extend.extend(yy, Helpers, _AST2['default']);

	function parse(input, options) {
	  // Just return if an already-compiled AST was passed in.
	  if (input.type === 'Program') {
	    return input;
	  }

	  _parser2['default'].yy = yy;

	  // Altering the shared object here, but this is ok as parser is a sync operation
	  yy.locInfo = function (locInfo) {
	    return new yy.SourceLocation(options && options.srcName, locInfo);
	  };

	  var strip = new _WhitespaceControl2['default']();
	  return strip.accept(_parser2['default'].parse(input));
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;
	exports.Compiler = Compiler;
	exports.precompile = precompile;
	exports.compile = compile;

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var _isArray$indexOf = __webpack_require__(12);

	var _AST = __webpack_require__(2);

	var _AST2 = _interopRequireWildcard(_AST);

	var slice = [].slice;

	function Compiler() {}

	// the foundHelper register will disambiguate helper lookup from finding a
	// function in a context. This is necessary for mustache compatibility, which
	// requires that context functions in blocks are evaluated by blockHelperMissing,
	// and then proceed as if the resulting value was provided to blockHelperMissing.

	Compiler.prototype = {
	  compiler: Compiler,

	  equals: function equals(other) {
	    var len = this.opcodes.length;
	    if (other.opcodes.length !== len) {
	      return false;
	    }

	    for (var i = 0; i < len; i++) {
	      var opcode = this.opcodes[i],
	          otherOpcode = other.opcodes[i];
	      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
	        return false;
	      }
	    }

	    // We know that length is the same between the two arrays because they are directly tied
	    // to the opcode behavior above.
	    len = this.children.length;
	    for (var i = 0; i < len; i++) {
	      if (!this.children[i].equals(other.children[i])) {
	        return false;
	      }
	    }

	    return true;
	  },

	  guid: 0,

	  compile: function compile(program, options) {
	    this.sourceNode = [];
	    this.opcodes = [];
	    this.children = [];
	    this.options = options;
	    this.stringParams = options.stringParams;
	    this.trackIds = options.trackIds;

	    options.blockParams = options.blockParams || [];

	    // These changes will propagate to the other compiler components
	    var knownHelpers = options.knownHelpers;
	    options.knownHelpers = {
	      helperMissing: true,
	      blockHelperMissing: true,
	      each: true,
	      'if': true,
	      unless: true,
	      'with': true,
	      log: true,
	      lookup: true
	    };
	    if (knownHelpers) {
	      for (var _name in knownHelpers) {
	        if (_name in knownHelpers) {
	          options.knownHelpers[_name] = knownHelpers[_name];
	        }
	      }
	    }

	    return this.accept(program);
	  },

	  compileProgram: function compileProgram(program) {
	    var childCompiler = new this.compiler(),
	        // eslint-disable-line new-cap
	    result = childCompiler.compile(program, this.options),
	        guid = this.guid++;

	    this.usePartial = this.usePartial || result.usePartial;

	    this.children[guid] = result;
	    this.useDepths = this.useDepths || result.useDepths;

	    return guid;
	  },

	  accept: function accept(node) {
	    this.sourceNode.unshift(node);
	    var ret = this[node.type](node);
	    this.sourceNode.shift();
	    return ret;
	  },

	  Program: function Program(program) {
	    this.options.blockParams.unshift(program.blockParams);

	    var body = program.body,
	        bodyLength = body.length;
	    for (var i = 0; i < bodyLength; i++) {
	      this.accept(body[i]);
	    }

	    this.options.blockParams.shift();

	    this.isSimple = bodyLength === 1;
	    this.blockParams = program.blockParams ? program.blockParams.length : 0;

	    return this;
	  },

	  BlockStatement: function BlockStatement(block) {
	    transformLiteralToPath(block);

	    var program = block.program,
	        inverse = block.inverse;

	    program = program && this.compileProgram(program);
	    inverse = inverse && this.compileProgram(inverse);

	    var type = this.classifySexpr(block);

	    if (type === 'helper') {
	      this.helperSexpr(block, program, inverse);
	    } else if (type === 'simple') {
	      this.simpleSexpr(block);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('blockValue', block.path.original);
	    } else {
	      this.ambiguousSexpr(block, program, inverse);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('ambiguousBlockValue');
	    }

	    this.opcode('append');
	  },

	  PartialStatement: function PartialStatement(partial) {
	    this.usePartial = true;

	    var params = partial.params;
	    if (params.length > 1) {
	      throw new _Exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
	    } else if (!params.length) {
	      params.push({ type: 'PathExpression', parts: [], depth: 0 });
	    }

	    var partialName = partial.name.original,
	        isDynamic = partial.name.type === 'SubExpression';
	    if (isDynamic) {
	      this.accept(partial.name);
	    }

	    this.setupFullMustacheParams(partial, undefined, undefined, true);

	    var indent = partial.indent || '';
	    if (this.options.preventIndent && indent) {
	      this.opcode('appendContent', indent);
	      indent = '';
	    }

	    this.opcode('invokePartial', isDynamic, partialName, indent);
	    this.opcode('append');
	  },

	  MustacheStatement: function MustacheStatement(mustache) {
	    this.SubExpression(mustache); // eslint-disable-line new-cap

	    if (mustache.escaped && !this.options.noEscape) {
	      this.opcode('appendEscaped');
	    } else {
	      this.opcode('append');
	    }
	  },

	  ContentStatement: function ContentStatement(content) {
	    if (content.value) {
	      this.opcode('appendContent', content.value);
	    }
	  },

	  CommentStatement: function CommentStatement() {},

	  SubExpression: function SubExpression(sexpr) {
	    transformLiteralToPath(sexpr);
	    var type = this.classifySexpr(sexpr);

	    if (type === 'simple') {
	      this.simpleSexpr(sexpr);
	    } else if (type === 'helper') {
	      this.helperSexpr(sexpr);
	    } else {
	      this.ambiguousSexpr(sexpr);
	    }
	  },
	  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
	    var path = sexpr.path,
	        name = path.parts[0],
	        isBlock = program != null || inverse != null;

	    this.opcode('getContext', path.depth);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    this.accept(path);

	    this.opcode('invokeAmbiguous', name, isBlock);
	  },

	  simpleSexpr: function simpleSexpr(sexpr) {
	    this.accept(sexpr.path);
	    this.opcode('resolvePossibleLambda');
	  },

	  helperSexpr: function helperSexpr(sexpr, program, inverse) {
	    var params = this.setupFullMustacheParams(sexpr, program, inverse),
	        path = sexpr.path,
	        name = path.parts[0];

	    if (this.options.knownHelpers[name]) {
	      this.opcode('invokeKnownHelper', params.length, name);
	    } else if (this.options.knownHelpersOnly) {
	      throw new _Exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
	    } else {
	      path.falsy = true;

	      this.accept(path);
	      this.opcode('invokeHelper', params.length, path.original, _AST2['default'].helpers.simpleId(path));
	    }
	  },

	  PathExpression: function PathExpression(path) {
	    this.addDepth(path.depth);
	    this.opcode('getContext', path.depth);

	    var name = path.parts[0],
	        scoped = _AST2['default'].helpers.scopedId(path),
	        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

	    if (blockParamId) {
	      this.opcode('lookupBlockParam', blockParamId, path.parts);
	    } else if (!name) {
	      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
	      this.opcode('pushContext');
	    } else if (path.data) {
	      this.options.data = true;
	      this.opcode('lookupData', path.depth, path.parts);
	    } else {
	      this.opcode('lookupOnContext', path.parts, path.falsy, scoped);
	    }
	  },

	  StringLiteral: function StringLiteral(string) {
	    this.opcode('pushString', string.value);
	  },

	  NumberLiteral: function NumberLiteral(number) {
	    this.opcode('pushLiteral', number.value);
	  },

	  BooleanLiteral: function BooleanLiteral(bool) {
	    this.opcode('pushLiteral', bool.value);
	  },

	  UndefinedLiteral: function UndefinedLiteral() {
	    this.opcode('pushLiteral', 'undefined');
	  },

	  NullLiteral: function NullLiteral() {
	    this.opcode('pushLiteral', 'null');
	  },

	  Hash: function Hash(hash) {
	    var pairs = hash.pairs,
	        i = 0,
	        l = pairs.length;

	    this.opcode('pushHash');

	    for (; i < l; i++) {
	      this.pushParam(pairs[i].value);
	    }
	    while (i--) {
	      this.opcode('assignToHash', pairs[i].key);
	    }
	    this.opcode('popHash');
	  },

	  // HELPERS
	  opcode: function opcode(name) {
	    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
	  },

	  addDepth: function addDepth(depth) {
	    if (!depth) {
	      return;
	    }

	    this.useDepths = true;
	  },

	  classifySexpr: function classifySexpr(sexpr) {
	    var isSimple = _AST2['default'].helpers.simpleId(sexpr.path);

	    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

	    // a mustache is an eligible helper if:
	    // * its id is simple (a single part, not `this` or `..`)
	    var isHelper = !isBlockParam && _AST2['default'].helpers.helperExpression(sexpr);

	    // if a mustache is an eligible helper but not a definite
	    // helper, it is ambiguous, and will be resolved in a later
	    // pass or at runtime.
	    var isEligible = !isBlockParam && (isHelper || isSimple);

	    // if ambiguous, we can possibly resolve the ambiguity now
	    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
	    if (isEligible && !isHelper) {
	      var _name2 = sexpr.path.parts[0],
	          options = this.options;

	      if (options.knownHelpers[_name2]) {
	        isHelper = true;
	      } else if (options.knownHelpersOnly) {
	        isEligible = false;
	      }
	    }

	    if (isHelper) {
	      return 'helper';
	    } else if (isEligible) {
	      return 'ambiguous';
	    } else {
	      return 'simple';
	    }
	  },

	  pushParams: function pushParams(params) {
	    for (var i = 0, l = params.length; i < l; i++) {
	      this.pushParam(params[i]);
	    }
	  },

	  pushParam: function pushParam(val) {
	    var value = val.value != null ? val.value : val.original || '';

	    if (this.stringParams) {
	      if (value.replace) {
	        value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
	      }

	      if (val.depth) {
	        this.addDepth(val.depth);
	      }
	      this.opcode('getContext', val.depth || 0);
	      this.opcode('pushStringParam', value, val.type);

	      if (val.type === 'SubExpression') {
	        // SubExpressions get evaluated and passed in
	        // in string params mode.
	        this.accept(val);
	      }
	    } else {
	      if (this.trackIds) {
	        var blockParamIndex = undefined;
	        if (val.parts && !_AST2['default'].helpers.scopedId(val) && !val.depth) {
	          blockParamIndex = this.blockParamIndex(val.parts[0]);
	        }
	        if (blockParamIndex) {
	          var blockParamChild = val.parts.slice(1).join('.');
	          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
	        } else {
	          value = val.original || value;
	          if (value.replace) {
	            value = value.replace(/^\.\//g, '').replace(/^\.$/g, '');
	          }

	          this.opcode('pushId', val.type, value);
	        }
	      }
	      this.accept(val);
	    }
	  },

	  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
	    var params = sexpr.params;
	    this.pushParams(params);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    if (sexpr.hash) {
	      this.accept(sexpr.hash);
	    } else {
	      this.opcode('emptyHash', omitEmpty);
	    }

	    return params;
	  },

	  blockParamIndex: function blockParamIndex(name) {
	    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
	      var blockParams = this.options.blockParams[depth],
	          param = blockParams && _isArray$indexOf.indexOf(blockParams, name);
	      if (blockParams && param >= 0) {
	        return [depth, param];
	      }
	    }
	  }
	};

	function precompile(input, options, env) {
	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
	  }

	  options = options || {};
	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var ast = env.parse(input, options),
	      environment = new env.Compiler().compile(ast, options);
	  return new env.JavaScriptCompiler().compile(environment, options);
	}

	function compile(input, _x, env) {
	  var options = arguments[1] === undefined ? {} : arguments[1];

	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
	  }

	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var compiled = undefined;

	  function compileInput() {
	    var ast = env.parse(input, options),
	        environment = new env.Compiler().compile(ast, options),
	        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
	    return env.template(templateSpec);
	  }

	  // Template is only compiled on first use and cached after that point.
	  function ret(context, execOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled.call(this, context, execOptions);
	  }
	  ret._setup = function (setupOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._setup(setupOptions);
	  };
	  ret._child = function (i, data, blockParams, depths) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._child(i, data, blockParams, depths);
	  };
	  return ret;
	}

	function argEquals(a, b) {
	  if (a === b) {
	    return true;
	  }

	  if (_isArray$indexOf.isArray(a) && _isArray$indexOf.isArray(b) && a.length === b.length) {
	    for (var i = 0; i < a.length; i++) {
	      if (!argEquals(a[i], b[i])) {
	        return false;
	      }
	    }
	    return true;
	  }
	}

	function transformLiteralToPath(sexpr) {
	  if (!sexpr.path.parts) {
	    var literal = sexpr.path;
	    // Casting to string here to make false and 0 literal values play nicely with the rest
	    // of the system.
	    sexpr.path = new _AST2['default'].PathExpression(false, 0, [literal.original + ''], literal.original + '', literal.loc);
	  }
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;

	var _COMPILER_REVISION$REVISION_CHANGES = __webpack_require__(9);

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var _isArray = __webpack_require__(12);

	var _CodeGen = __webpack_require__(17);

	var _CodeGen2 = _interopRequireWildcard(_CodeGen);

	function Literal(value) {
	  this.value = value;
	}

	function JavaScriptCompiler() {}

	JavaScriptCompiler.prototype = {
	  // PUBLIC API: You can override these methods in a subclass to provide
	  // alternative compiled forms for name lookup and buffering semantics
	  nameLookup: function nameLookup(parent, name /* , type*/) {
	    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	      return [parent, '.', name];
	    } else {
	      return [parent, '[\'', name, '\']'];
	    }
	  },
	  depthedLookup: function depthedLookup(name) {
	    return [this.aliasable('this.lookup'), '(depths, "', name, '")'];
	  },

	  compilerInfo: function compilerInfo() {
	    var revision = _COMPILER_REVISION$REVISION_CHANGES.COMPILER_REVISION,
	        versions = _COMPILER_REVISION$REVISION_CHANGES.REVISION_CHANGES[revision];
	    return [revision, versions];
	  },

	  appendToBuffer: function appendToBuffer(source, location, explicit) {
	    // Force a source as this simplifies the merge logic.
	    if (!_isArray.isArray(source)) {
	      source = [source];
	    }
	    source = this.source.wrap(source, location);

	    if (this.environment.isSimple) {
	      return ['return ', source, ';'];
	    } else if (explicit) {
	      // This is a case where the buffer operation occurs as a child of another
	      // construct, generally braces. We have to explicitly output these buffer
	      // operations to ensure that the emitted code goes in the correct location.
	      return ['buffer += ', source, ';'];
	    } else {
	      source.appendToBuffer = true;
	      return source;
	    }
	  },

	  initializeBuffer: function initializeBuffer() {
	    return this.quotedString('');
	  },
	  // END PUBLIC API

	  compile: function compile(environment, options, context, asObject) {
	    this.environment = environment;
	    this.options = options;
	    this.stringParams = this.options.stringParams;
	    this.trackIds = this.options.trackIds;
	    this.precompile = !asObject;

	    this.name = this.environment.name;
	    this.isChild = !!context;
	    this.context = context || {
	      programs: [],
	      environments: []
	    };

	    this.preamble();

	    this.stackSlot = 0;
	    this.stackVars = [];
	    this.aliases = {};
	    this.registers = { list: [] };
	    this.hashes = [];
	    this.compileStack = [];
	    this.inlineStack = [];
	    this.blockParams = [];

	    this.compileChildren(environment, options);

	    this.useDepths = this.useDepths || environment.useDepths || this.options.compat;
	    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

	    var opcodes = environment.opcodes,
	        opcode = undefined,
	        firstLoc = undefined,
	        i = undefined,
	        l = undefined;

	    for (i = 0, l = opcodes.length; i < l; i++) {
	      opcode = opcodes[i];

	      this.source.currentLocation = opcode.loc;
	      firstLoc = firstLoc || opcode.loc;
	      this[opcode.opcode].apply(this, opcode.args);
	    }

	    // Flush any trailing content that might be pending.
	    this.source.currentLocation = firstLoc;
	    this.pushSource('');

	    /* istanbul ignore next */
	    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
	      throw new _Exception2['default']('Compile completed with content left on stack');
	    }

	    var fn = this.createFunctionContext(asObject);
	    if (!this.isChild) {
	      var ret = {
	        compiler: this.compilerInfo(),
	        main: fn
	      };
	      var programs = this.context.programs;
	      for (i = 0, l = programs.length; i < l; i++) {
	        if (programs[i]) {
	          ret[i] = programs[i];
	        }
	      }

	      if (this.environment.usePartial) {
	        ret.usePartial = true;
	      }
	      if (this.options.data) {
	        ret.useData = true;
	      }
	      if (this.useDepths) {
	        ret.useDepths = true;
	      }
	      if (this.useBlockParams) {
	        ret.useBlockParams = true;
	      }
	      if (this.options.compat) {
	        ret.compat = true;
	      }

	      if (!asObject) {
	        ret.compiler = JSON.stringify(ret.compiler);

	        this.source.currentLocation = { start: { line: 1, column: 0 } };
	        ret = this.objectLiteral(ret);

	        if (options.srcName) {
	          ret = ret.toStringWithSourceMap({ file: options.destName });
	          ret.map = ret.map && ret.map.toString();
	        } else {
	          ret = ret.toString();
	        }
	      } else {
	        ret.compilerOptions = this.options;
	      }

	      return ret;
	    } else {
	      return fn;
	    }
	  },

	  preamble: function preamble() {
	    // track the last context pushed into place to allow skipping the
	    // getContext opcode when it would be a noop
	    this.lastContext = 0;
	    this.source = new _CodeGen2['default'](this.options.srcName);
	  },

	  createFunctionContext: function createFunctionContext(asObject) {
	    var varDeclarations = '';

	    var locals = this.stackVars.concat(this.registers.list);
	    if (locals.length > 0) {
	      varDeclarations += ', ' + locals.join(', ');
	    }

	    // Generate minimizer alias mappings
	    //
	    // When using true SourceNodes, this will update all references to the given alias
	    // as the source nodes are reused in situ. For the non-source node compilation mode,
	    // aliases will not be used, but this case is already being run on the client and
	    // we aren't concern about minimizing the template size.
	    var aliasCount = 0;
	    for (var alias in this.aliases) {
	      // eslint-disable-line guard-for-in
	      var node = this.aliases[alias];

	      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
	        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
	        node.children[0] = 'alias' + aliasCount;
	      }
	    }

	    var params = ['depth0', 'helpers', 'partials', 'data'];

	    if (this.useBlockParams || this.useDepths) {
	      params.push('blockParams');
	    }
	    if (this.useDepths) {
	      params.push('depths');
	    }

	    // Perform a second pass over the output to merge content when possible
	    var source = this.mergeSource(varDeclarations);

	    if (asObject) {
	      params.push(source);

	      return Function.apply(this, params);
	    } else {
	      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
	    }
	  },
	  mergeSource: function mergeSource(varDeclarations) {
	    var isSimple = this.environment.isSimple,
	        appendOnly = !this.forceBuffer,
	        appendFirst = undefined,
	        sourceSeen = undefined,
	        bufferStart = undefined,
	        bufferEnd = undefined;
	    this.source.each(function (line) {
	      if (line.appendToBuffer) {
	        if (bufferStart) {
	          line.prepend('  + ');
	        } else {
	          bufferStart = line;
	        }
	        bufferEnd = line;
	      } else {
	        if (bufferStart) {
	          if (!sourceSeen) {
	            appendFirst = true;
	          } else {
	            bufferStart.prepend('buffer += ');
	          }
	          bufferEnd.add(';');
	          bufferStart = bufferEnd = undefined;
	        }

	        sourceSeen = true;
	        if (!isSimple) {
	          appendOnly = false;
	        }
	      }
	    });

	    if (appendOnly) {
	      if (bufferStart) {
	        bufferStart.prepend('return ');
	        bufferEnd.add(';');
	      } else if (!sourceSeen) {
	        this.source.push('return "";');
	      }
	    } else {
	      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

	      if (bufferStart) {
	        bufferStart.prepend('return buffer + ');
	        bufferEnd.add(';');
	      } else {
	        this.source.push('return buffer;');
	      }
	    }

	    if (varDeclarations) {
	      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
	    }

	    return this.source.merge();
	  },

	  // [blockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // On stack, after: return value of blockHelperMissing
	  //
	  // The purpose of this opcode is to take a block of the form
	  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
	  // replace it on the stack with the result of properly
	  // invoking blockHelperMissing.
	  blockValue: function blockValue(name) {
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs(name, 0, params);

	    var blockName = this.popStack();
	    params.splice(1, 0, blockName);

	    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
	  },

	  // [ambiguousBlockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // Compiler value, before: lastHelper=value of last found helper, if any
	  // On stack, after, if no lastHelper: same as [blockValue]
	  // On stack, after, if lastHelper: value
	  ambiguousBlockValue: function ambiguousBlockValue() {
	    // We're being a bit cheeky and reusing the options value from the prior exec
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs('', 0, params, true);

	    this.flushInline();

	    var current = this.topStack();
	    params.splice(1, 0, current);

	    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
	  },

	  // [appendContent]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  //
	  // Appends the string value of `content` to the current buffer
	  appendContent: function appendContent(content) {
	    if (this.pendingContent) {
	      content = this.pendingContent + content;
	    } else {
	      this.pendingLocation = this.source.currentLocation;
	    }

	    this.pendingContent = content;
	  },

	  // [append]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Coerces `value` to a String and appends it to the current buffer.
	  //
	  // If `value` is truthy, or 0, it is coerced into a string and appended
	  // Otherwise, the empty string is appended
	  append: function append() {
	    if (this.isInline()) {
	      this.replaceStack(function (current) {
	        return [' != null ? ', current, ' : ""'];
	      });

	      this.pushSource(this.appendToBuffer(this.popStack()));
	    } else {
	      var local = this.popStack();
	      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
	      if (this.environment.isSimple) {
	        this.pushSource(['else { ', this.appendToBuffer('\'\'', undefined, true), ' }']);
	      }
	    }
	  },

	  // [appendEscaped]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Escape `value` and append it to the buffer
	  appendEscaped: function appendEscaped() {
	    this.pushSource(this.appendToBuffer([this.aliasable('this.escapeExpression'), '(', this.popStack(), ')']));
	  },

	  // [getContext]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  // Compiler value, after: lastContext=depth
	  //
	  // Set the value of the `lastContext` compiler value to the depth
	  getContext: function getContext(depth) {
	    this.lastContext = depth;
	  },

	  // [pushContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext, ...
	  //
	  // Pushes the value of the current context onto the stack.
	  pushContext: function pushContext() {
	    this.pushStackLiteral(this.contextName(this.lastContext));
	  },

	  // [lookupOnContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext[name], ...
	  //
	  // Looks up the value of `name` on the current context and pushes
	  // it onto the stack.
	  lookupOnContext: function lookupOnContext(parts, falsy, scoped) {
	    var i = 0;

	    if (!scoped && this.options.compat && !this.lastContext) {
	      // The depthed query is expected to handle the undefined logic for the root level that
	      // is implemented below, so we evaluate that directly in compat mode
	      this.push(this.depthedLookup(parts[i++]));
	    } else {
	      this.pushContext();
	    }

	    this.resolvePath('context', parts, i, falsy);
	  },

	  // [lookupBlockParam]
	  //
	  // On stack, before: ...
	  // On stack, after: blockParam[name], ...
	  //
	  // Looks up the value of `parts` on the given block param and pushes
	  // it onto the stack.
	  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
	    this.useBlockParams = true;

	    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
	    this.resolvePath('context', parts, 1);
	  },

	  // [lookupData]
	  //
	  // On stack, before: ...
	  // On stack, after: data, ...
	  //
	  // Push the data lookup operator
	  lookupData: function lookupData(depth, parts) {
	    if (!depth) {
	      this.pushStackLiteral('data');
	    } else {
	      this.pushStackLiteral('this.data(data, ' + depth + ')');
	    }

	    this.resolvePath('data', parts, 0, true);
	  },

	  resolvePath: function resolvePath(type, parts, i, falsy) {
	    var _this = this;

	    if (this.options.strict || this.options.assumeObjects) {
	      this.push(strictLookup(this.options.strict, this, parts, type));
	      return;
	    }

	    var len = parts.length;
	    for (; i < len; i++) {
	      /*eslint-disable no-loop-func */
	      this.replaceStack(function (current) {
	        var lookup = _this.nameLookup(current, parts[i], type);
	        // We want to ensure that zero and false are handled properly if the context (falsy flag)
	        // needs to have the special handling for these values.
	        if (!falsy) {
	          return [' != null ? ', lookup, ' : ', current];
	        } else {
	          // Otherwise we can use generic falsy handling
	          return [' && ', lookup];
	        }
	      });
	      /*eslint-enable no-loop-func */
	    }
	  },

	  // [resolvePossibleLambda]
	  //
	  // On stack, before: value, ...
	  // On stack, after: resolved value, ...
	  //
	  // If the `value` is a lambda, replace it on the stack by
	  // the return value of the lambda
	  resolvePossibleLambda: function resolvePossibleLambda() {
	    this.push([this.aliasable('this.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
	  },

	  // [pushStringParam]
	  //
	  // On stack, before: ...
	  // On stack, after: string, currentContext, ...
	  //
	  // This opcode is designed for use in string mode, which
	  // provides the string value of a parameter along with its
	  // depth rather than resolving it immediately.
	  pushStringParam: function pushStringParam(string, type) {
	    this.pushContext();
	    this.pushString(type);

	    // If it's a subexpression, the string result
	    // will be pushed after this opcode.
	    if (type !== 'SubExpression') {
	      if (typeof string === 'string') {
	        this.pushString(string);
	      } else {
	        this.pushStackLiteral(string);
	      }
	    }
	  },

	  emptyHash: function emptyHash(omitEmpty) {
	    if (this.trackIds) {
	      this.push('{}'); // hashIds
	    }
	    if (this.stringParams) {
	      this.push('{}'); // hashContexts
	      this.push('{}'); // hashTypes
	    }
	    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
	  },
	  pushHash: function pushHash() {
	    if (this.hash) {
	      this.hashes.push(this.hash);
	    }
	    this.hash = { values: [], types: [], contexts: [], ids: [] };
	  },
	  popHash: function popHash() {
	    var hash = this.hash;
	    this.hash = this.hashes.pop();

	    if (this.trackIds) {
	      this.push(this.objectLiteral(hash.ids));
	    }
	    if (this.stringParams) {
	      this.push(this.objectLiteral(hash.contexts));
	      this.push(this.objectLiteral(hash.types));
	    }

	    this.push(this.objectLiteral(hash.values));
	  },

	  // [pushString]
	  //
	  // On stack, before: ...
	  // On stack, after: quotedString(string), ...
	  //
	  // Push a quoted version of `string` onto the stack
	  pushString: function pushString(string) {
	    this.pushStackLiteral(this.quotedString(string));
	  },

	  // [pushLiteral]
	  //
	  // On stack, before: ...
	  // On stack, after: value, ...
	  //
	  // Pushes a value onto the stack. This operation prevents
	  // the compiler from creating a temporary variable to hold
	  // it.
	  pushLiteral: function pushLiteral(value) {
	    this.pushStackLiteral(value);
	  },

	  // [pushProgram]
	  //
	  // On stack, before: ...
	  // On stack, after: program(guid), ...
	  //
	  // Push a program expression onto the stack. This takes
	  // a compile-time guid and converts it into a runtime-accessible
	  // expression.
	  pushProgram: function pushProgram(guid) {
	    if (guid != null) {
	      this.pushStackLiteral(this.programExpression(guid));
	    } else {
	      this.pushStackLiteral(null);
	    }
	  },

	  // [invokeHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // Pops off the helper's parameters, invokes the helper,
	  // and pushes the helper's return value onto the stack.
	  //
	  // If the helper is not found, `helperMissing` is called.
	  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
	    var nonHelper = this.popStack(),
	        helper = this.setupHelper(paramSize, name),
	        simple = isSimple ? [helper.name, ' || '] : '';

	    var lookup = ['('].concat(simple, nonHelper);
	    if (!this.options.strict) {
	      lookup.push(' || ', this.aliasable('helpers.helperMissing'));
	    }
	    lookup.push(')');

	    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
	  },

	  // [invokeKnownHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // This operation is used when the helper is known to exist,
	  // so a `helperMissing` fallback is not required.
	  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
	    var helper = this.setupHelper(paramSize, name);
	    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
	  },

	  // [invokeAmbiguous]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of disambiguation
	  //
	  // This operation is used when an expression like `{{foo}}`
	  // is provided, but we don't know at compile-time whether it
	  // is a helper or a path.
	  //
	  // This operation emits more code than the other options,
	  // and can be avoided by passing the `knownHelpers` and
	  // `knownHelpersOnly` flags at compile-time.
	  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
	    this.useRegister('helper');

	    var nonHelper = this.popStack();

	    this.emptyHash();
	    var helper = this.setupHelper(0, name, helperCall);

	    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

	    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
	    if (!this.options.strict) {
	      lookup[0] = '(helper = ';
	      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
	    }

	    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
	  },

	  // [invokePartial]
	  //
	  // On stack, before: context, ...
	  // On stack after: result of partial invocation
	  //
	  // This operation pops off a context, invokes a partial with that context,
	  // and pushes the result of the invocation back.
	  invokePartial: function invokePartial(isDynamic, name, indent) {
	    var params = [],
	        options = this.setupParams(name, 1, params, false);

	    if (isDynamic) {
	      name = this.popStack();
	      delete options.name;
	    }

	    if (indent) {
	      options.indent = JSON.stringify(indent);
	    }
	    options.helpers = 'helpers';
	    options.partials = 'partials';

	    if (!isDynamic) {
	      params.unshift(this.nameLookup('partials', name, 'partial'));
	    } else {
	      params.unshift(name);
	    }

	    if (this.options.compat) {
	      options.depths = 'depths';
	    }
	    options = this.objectLiteral(options);
	    params.push(options);

	    this.push(this.source.functionCall('this.invokePartial', '', params));
	  },

	  // [assignToHash]
	  //
	  // On stack, before: value, ..., hash, ...
	  // On stack, after: ..., hash, ...
	  //
	  // Pops a value off the stack and assigns it to the current hash
	  assignToHash: function assignToHash(key) {
	    var value = this.popStack(),
	        context = undefined,
	        type = undefined,
	        id = undefined;

	    if (this.trackIds) {
	      id = this.popStack();
	    }
	    if (this.stringParams) {
	      type = this.popStack();
	      context = this.popStack();
	    }

	    var hash = this.hash;
	    if (context) {
	      hash.contexts[key] = context;
	    }
	    if (type) {
	      hash.types[key] = type;
	    }
	    if (id) {
	      hash.ids[key] = id;
	    }
	    hash.values[key] = value;
	  },

	  pushId: function pushId(type, name, child) {
	    if (type === 'BlockParam') {
	      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
	    } else if (type === 'PathExpression') {
	      this.pushString(name);
	    } else if (type === 'SubExpression') {
	      this.pushStackLiteral('true');
	    } else {
	      this.pushStackLiteral('null');
	    }
	  },

	  // HELPERS

	  compiler: JavaScriptCompiler,

	  compileChildren: function compileChildren(environment, options) {
	    var children = environment.children,
	        child = undefined,
	        compiler = undefined;

	    for (var i = 0, l = children.length; i < l; i++) {
	      child = children[i];
	      compiler = new this.compiler(); // eslint-disable-line new-cap

	      var index = this.matchExistingProgram(child);

	      if (index == null) {
	        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
	        index = this.context.programs.length;
	        child.index = index;
	        child.name = 'program' + index;
	        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
	        this.context.environments[index] = child;

	        this.useDepths = this.useDepths || compiler.useDepths;
	        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
	      } else {
	        child.index = index;
	        child.name = 'program' + index;

	        this.useDepths = this.useDepths || child.useDepths;
	        this.useBlockParams = this.useBlockParams || child.useBlockParams;
	      }
	    }
	  },
	  matchExistingProgram: function matchExistingProgram(child) {
	    for (var i = 0, len = this.context.environments.length; i < len; i++) {
	      var environment = this.context.environments[i];
	      if (environment && environment.equals(child)) {
	        return i;
	      }
	    }
	  },

	  programExpression: function programExpression(guid) {
	    var child = this.environment.children[guid],
	        programParams = [child.index, 'data', child.blockParams];

	    if (this.useBlockParams || this.useDepths) {
	      programParams.push('blockParams');
	    }
	    if (this.useDepths) {
	      programParams.push('depths');
	    }

	    return 'this.program(' + programParams.join(', ') + ')';
	  },

	  useRegister: function useRegister(name) {
	    if (!this.registers[name]) {
	      this.registers[name] = true;
	      this.registers.list.push(name);
	    }
	  },

	  push: function push(expr) {
	    if (!(expr instanceof Literal)) {
	      expr = this.source.wrap(expr);
	    }

	    this.inlineStack.push(expr);
	    return expr;
	  },

	  pushStackLiteral: function pushStackLiteral(item) {
	    this.push(new Literal(item));
	  },

	  pushSource: function pushSource(source) {
	    if (this.pendingContent) {
	      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
	      this.pendingContent = undefined;
	    }

	    if (source) {
	      this.source.push(source);
	    }
	  },

	  replaceStack: function replaceStack(callback) {
	    var prefix = ['('],
	        stack = undefined,
	        createdStack = undefined,
	        usedLiteral = undefined;

	    /* istanbul ignore next */
	    if (!this.isInline()) {
	      throw new _Exception2['default']('replaceStack on non-inline');
	    }

	    // We want to merge the inline statement into the replacement statement via ','
	    var top = this.popStack(true);

	    if (top instanceof Literal) {
	      // Literals do not need to be inlined
	      stack = [top.value];
	      prefix = ['(', stack];
	      usedLiteral = true;
	    } else {
	      // Get or create the current stack name for use by the inline
	      createdStack = true;
	      var _name = this.incrStack();

	      prefix = ['((', this.push(_name), ' = ', top, ')'];
	      stack = this.topStack();
	    }

	    var item = callback.call(this, stack);

	    if (!usedLiteral) {
	      this.popStack();
	    }
	    if (createdStack) {
	      this.stackSlot--;
	    }
	    this.push(prefix.concat(item, ')'));
	  },

	  incrStack: function incrStack() {
	    this.stackSlot++;
	    if (this.stackSlot > this.stackVars.length) {
	      this.stackVars.push('stack' + this.stackSlot);
	    }
	    return this.topStackName();
	  },
	  topStackName: function topStackName() {
	    return 'stack' + this.stackSlot;
	  },
	  flushInline: function flushInline() {
	    var inlineStack = this.inlineStack;
	    this.inlineStack = [];
	    for (var i = 0, len = inlineStack.length; i < len; i++) {
	      var entry = inlineStack[i];
	      /* istanbul ignore if */
	      if (entry instanceof Literal) {
	        this.compileStack.push(entry);
	      } else {
	        var stack = this.incrStack();
	        this.pushSource([stack, ' = ', entry, ';']);
	        this.compileStack.push(stack);
	      }
	    }
	  },
	  isInline: function isInline() {
	    return this.inlineStack.length;
	  },

	  popStack: function popStack(wrapped) {
	    var inline = this.isInline(),
	        item = (inline ? this.inlineStack : this.compileStack).pop();

	    if (!wrapped && item instanceof Literal) {
	      return item.value;
	    } else {
	      if (!inline) {
	        /* istanbul ignore next */
	        if (!this.stackSlot) {
	          throw new _Exception2['default']('Invalid stack pop');
	        }
	        this.stackSlot--;
	      }
	      return item;
	    }
	  },

	  topStack: function topStack() {
	    var stack = this.isInline() ? this.inlineStack : this.compileStack,
	        item = stack[stack.length - 1];

	    /* istanbul ignore if */
	    if (item instanceof Literal) {
	      return item.value;
	    } else {
	      return item;
	    }
	  },

	  contextName: function contextName(context) {
	    if (this.useDepths && context) {
	      return 'depths[' + context + ']';
	    } else {
	      return 'depth' + context;
	    }
	  },

	  quotedString: function quotedString(str) {
	    return this.source.quotedString(str);
	  },

	  objectLiteral: function objectLiteral(obj) {
	    return this.source.objectLiteral(obj);
	  },

	  aliasable: function aliasable(name) {
	    var ret = this.aliases[name];
	    if (ret) {
	      ret.referenceCount++;
	      return ret;
	    }

	    ret = this.aliases[name] = this.source.wrap(name);
	    ret.aliasable = true;
	    ret.referenceCount = 1;

	    return ret;
	  },

	  setupHelper: function setupHelper(paramSize, name, blockHelper) {
	    var params = [],
	        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
	    var foundHelper = this.nameLookup('helpers', name, 'helper');

	    return {
	      params: params,
	      paramsInit: paramsInit,
	      name: foundHelper,
	      callParams: [this.contextName(0)].concat(params)
	    };
	  },

	  setupParams: function setupParams(helper, paramSize, params) {
	    var options = {},
	        contexts = [],
	        types = [],
	        ids = [],
	        param = undefined;

	    options.name = this.quotedString(helper);
	    options.hash = this.popStack();

	    if (this.trackIds) {
	      options.hashIds = this.popStack();
	    }
	    if (this.stringParams) {
	      options.hashTypes = this.popStack();
	      options.hashContexts = this.popStack();
	    }

	    var inverse = this.popStack(),
	        program = this.popStack();

	    // Avoid setting fn and inverse if neither are set. This allows
	    // helpers to do a check for `if (options.fn)`
	    if (program || inverse) {
	      options.fn = program || 'this.noop';
	      options.inverse = inverse || 'this.noop';
	    }

	    // The parameters go on to the stack in order (making sure that they are evaluated in order)
	    // so we need to pop them off the stack in reverse order
	    var i = paramSize;
	    while (i--) {
	      param = this.popStack();
	      params[i] = param;

	      if (this.trackIds) {
	        ids[i] = this.popStack();
	      }
	      if (this.stringParams) {
	        types[i] = this.popStack();
	        contexts[i] = this.popStack();
	      }
	    }

	    if (this.trackIds) {
	      options.ids = this.source.generateArray(ids);
	    }
	    if (this.stringParams) {
	      options.types = this.source.generateArray(types);
	      options.contexts = this.source.generateArray(contexts);
	    }

	    if (this.options.data) {
	      options.data = 'data';
	    }
	    if (this.useBlockParams) {
	      options.blockParams = 'blockParams';
	    }
	    return options;
	  },

	  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
	    var options = this.setupParams(helper, paramSize, params, true);
	    options = this.objectLiteral(options);
	    if (useRegister) {
	      this.useRegister('options');
	      params.push('options');
	      return ['options=', options];
	    } else {
	      params.push(options);
	      return '';
	    }
	  }
	};

	(function () {
	  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

	  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

	  for (var i = 0, l = reservedWords.length; i < l; i++) {
	    compilerWords[reservedWords[i]] = true;
	  }
	})();

	JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
	  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
	};

	function strictLookup(requireTerminal, compiler, parts, type) {
	  var stack = compiler.popStack(),
	      i = 0,
	      len = parts.length;
	  if (requireTerminal) {
	    len--;
	  }

	  for (; i < len; i++) {
	    stack = compiler.nameLookup(stack, parts[i], type);
	  }

	  if (requireTerminal) {
	    return [compiler.aliasable('this.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
	  } else {
	    return stack;
	  }
	}

	exports['default'] = JavaScriptCompiler;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var _AST = __webpack_require__(2);

	var _AST2 = _interopRequireWildcard(_AST);

	function Visitor() {
	  this.parents = [];
	}

	Visitor.prototype = {
	  constructor: Visitor,
	  mutating: false,

	  // Visits a given value. If mutating, will replace the value if necessary.
	  acceptKey: function acceptKey(node, name) {
	    var value = this.accept(node[name]);
	    if (this.mutating) {
	      // Hacky sanity check:
	      if (value && (!value.type || !_AST2['default'][value.type])) {
	        throw new _Exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
	      }
	      node[name] = value;
	    }
	  },

	  // Performs an accept operation with added sanity check to ensure
	  // required keys are not removed.
	  acceptRequired: function acceptRequired(node, name) {
	    this.acceptKey(node, name);

	    if (!node[name]) {
	      throw new _Exception2['default'](node.type + ' requires ' + name);
	    }
	  },

	  // Traverses a given array. If mutating, empty respnses will be removed
	  // for child elements.
	  acceptArray: function acceptArray(array) {
	    for (var i = 0, l = array.length; i < l; i++) {
	      this.acceptKey(array, i);

	      if (!array[i]) {
	        array.splice(i, 1);
	        i--;
	        l--;
	      }
	    }
	  },

	  accept: function accept(object) {
	    if (!object) {
	      return;
	    }

	    if (this.current) {
	      this.parents.unshift(this.current);
	    }
	    this.current = object;

	    var ret = this[object.type](object);

	    this.current = this.parents.shift();

	    if (!this.mutating || ret) {
	      return ret;
	    } else if (ret !== false) {
	      return object;
	    }
	  },

	  Program: function Program(program) {
	    this.acceptArray(program.body);
	  },

	  MustacheStatement: function MustacheStatement(mustache) {
	    this.acceptRequired(mustache, 'path');
	    this.acceptArray(mustache.params);
	    this.acceptKey(mustache, 'hash');
	  },

	  BlockStatement: function BlockStatement(block) {
	    this.acceptRequired(block, 'path');
	    this.acceptArray(block.params);
	    this.acceptKey(block, 'hash');

	    this.acceptKey(block, 'program');
	    this.acceptKey(block, 'inverse');
	  },

	  PartialStatement: function PartialStatement(partial) {
	    this.acceptRequired(partial, 'name');
	    this.acceptArray(partial.params);
	    this.acceptKey(partial, 'hash');
	  },

	  ContentStatement: function ContentStatement() {},
	  CommentStatement: function CommentStatement() {},

	  SubExpression: function SubExpression(sexpr) {
	    this.acceptRequired(sexpr, 'path');
	    this.acceptArray(sexpr.params);
	    this.acceptKey(sexpr, 'hash');
	  },

	  PathExpression: function PathExpression() {},

	  StringLiteral: function StringLiteral() {},
	  NumberLiteral: function NumberLiteral() {},
	  BooleanLiteral: function BooleanLiteral() {},
	  UndefinedLiteral: function UndefinedLiteral() {},
	  NullLiteral: function NullLiteral() {},

	  Hash: function Hash(hash) {
	    this.acceptArray(hash.pairs);
	  },
	  HashPair: function HashPair(pair) {
	    this.acceptRequired(pair, 'value');
	  }
	};

	exports['default'] = Visitor;
	module.exports = exports['default'];
	/* content */ /* comment */ /* path */ /* string */ /* number */ /* bool */ /* literal */ /* literal */

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	exports.__esModule = true;
	/*global window */

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	  };
	};

	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};

	exports.__esModule = true;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;
	exports.HandlebarsEnvironment = HandlebarsEnvironment;
	exports.createFrame = createFrame;

	var _import = __webpack_require__(12);

	var Utils = _interopRequireWildcard(_import);

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var VERSION = '3.0.1';
	exports.VERSION = VERSION;
	var COMPILER_REVISION = 6;

	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '== 1.x.x',
	  5: '== 2.0.0-alpha.x',
	  6: '>= 2.0.0-beta.1'
	};

	exports.REVISION_CHANGES = REVISION_CHANGES;
	var isArray = Utils.isArray,
	    isFunction = Utils.isFunction,
	    toString = Utils.toString,
	    objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};

	  registerDefaultHelpers(this);
	}

	HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: logger,
	  log: log,

	  registerHelper: function registerHelper(name, fn) {
	    if (toString.call(name) === objectType) {
	      if (fn) {
	        throw new _Exception2['default']('Arg not supported with multiple helpers');
	      }
	      Utils.extend(this.helpers, name);
	    } else {
	      this.helpers[name] = fn;
	    }
	  },
	  unregisterHelper: function unregisterHelper(name) {
	    delete this.helpers[name];
	  },

	  registerPartial: function registerPartial(name, partial) {
	    if (toString.call(name) === objectType) {
	      Utils.extend(this.partials, name);
	    } else {
	      if (typeof partial === 'undefined') {
	        throw new _Exception2['default']('Attempting to register a partial as undefined');
	      }
	      this.partials[name] = partial;
	    }
	  },
	  unregisterPartial: function unregisterPartial(name) {
	    delete this.partials[name];
	  }
	};

	function registerDefaultHelpers(instance) {
	  instance.registerHelper('helperMissing', function () {
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} constuct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });

	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = createFrame(options.data);
	        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });

	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _Exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          execIteration(i, i, i === context.length - 1);
	        }
	      } else {
	        var priorKey = undefined;

	        for (var key in context) {
	          if (context.hasOwnProperty(key)) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          }
	        }
	        if (priorKey) {
	          execIteration(priorKey, i - 1, true);
	        }
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });

	  instance.registerHelper('if', function (conditional, options) {
	    if (isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
	  });

	  instance.registerHelper('with', function (context, options) {
	    if (isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!Utils.isEmpty(context)) {
	      if (options.data && options.ids) {
	        var data = createFrame(options.data);
	        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
	        options = { data: data };
	      }

	      return fn(context, options);
	    } else {
	      return options.inverse(this);
	    }
	  });

	  instance.registerHelper('log', function (message, options) {
	    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
	    instance.log(level, message);
	  });

	  instance.registerHelper('lookup', function (obj, field) {
	    return obj && obj[field];
	  });
	}

	var logger = {
	  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

	  // State enum
	  DEBUG: 0,
	  INFO: 1,
	  WARN: 2,
	  ERROR: 3,
	  level: 1,

	  // Can be overridden in the host environment
	  log: function log(level, message) {
	    if (typeof console !== 'undefined' && logger.level <= level) {
	      var method = logger.methodMap[level];
	      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports.logger = logger;
	var log = logger.log;

	exports.log = log;

	function createFrame(object) {
	  var frame = Utils.extend({}, object);
	  frame._parent = object;
	  return frame;
	}

	/* [args, ]options */

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	// Build out our basic SafeString type
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      column = undefined;
	  if (loc) {
	    line = loc.start.line;
	    column = loc.start.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  if (loc) {
	    this.lineNumber = line;
	    this.column = column;
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.extend = extend;

	// Older IE versions do not directly support indexOf so we must implement our own, sadly.
	exports.indexOf = indexOf;
	exports.escapeExpression = escapeExpression;
	exports.isEmpty = isEmpty;
	exports.blockParams = blockParams;
	exports.appendContextPath = appendContextPath;
	var escape = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  '\'': '&#x27;',
	  '`': '&#x60;'
	};

	var badChars = /[&<>"'`]/g,
	    possible = /[&<>"'`]/;

	function escapeChar(chr) {
	  return escape[chr];
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	        obj[key] = arguments[i][key];
	      }
	    }
	  }

	  return obj;
	}

	var toString = Object.prototype.toString;

	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	/*eslint-disable func-style, no-var */
	var isFunction = function isFunction(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	/* istanbul ignore next */
	if (isFunction(/x/)) {
	  exports.isFunction = isFunction = function (value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	var isFunction;
	exports.isFunction = isFunction;
	/*eslint-enable func-style, no-var */

	/* istanbul ignore next */
	var isArray = Array.isArray || function (value) {
	  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
	};exports.isArray = isArray;

	function indexOf(array, value) {
	  for (var i = 0, len = array.length; i < len; i++) {
	    if (array[i] === value) {
	      return i;
	    }
	  }
	  return -1;
	}

	function escapeExpression(string) {
	  if (typeof string !== 'string') {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return '';
	    } else if (!string) {
	      return string + '';
	    }

	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = '' + string;
	  }

	  if (!possible.test(string)) {
	    return string;
	  }
	  return string.replace(badChars, escapeChar);
	}

	function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	function blockParams(params, ids) {
	  params.path = ids;
	  return params;
	}

	function appendContextPath(contextPath, id) {
	  return (contextPath ? contextPath + '.' : '') + id;
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;
	exports.checkRevision = checkRevision;

	// TODO: Remove this line and break up compilePartial

	exports.template = template;
	exports.wrapProgram = wrapProgram;
	exports.resolvePartial = resolvePartial;
	exports.invokePartial = invokePartial;
	exports.noop = noop;

	var _import = __webpack_require__(12);

	var Utils = _interopRequireWildcard(_import);

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	var _COMPILER_REVISION$REVISION_CHANGES$createFrame = __webpack_require__(9);

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
	          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
	      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
	    }
	  }
	}

	function template(templateSpec, env) {
	  /* istanbul ignore next */
	  if (!env) {
	    throw new _Exception2['default']('No environment passed to template');
	  }
	  if (!templateSpec || !templateSpec.main) {
	    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
	  }

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  env.VM.checkRevision(templateSpec.compiler);

	  function invokePartialWrapper(partial, context, options) {
	    if (options.hash) {
	      context = Utils.extend({}, context, options.hash);
	    }

	    partial = env.VM.resolvePartial.call(this, partial, context, options);
	    var result = env.VM.invokePartial.call(this, partial, context, options);

	    if (result == null && env.compile) {
	      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	      result = options.partials[options.name](context, options);
	    }
	    if (result != null) {
	      if (options.indent) {
	        var lines = result.split('\n');
	        for (var i = 0, l = lines.length; i < l; i++) {
	          if (!lines[i] && i + 1 === l) {
	            break;
	          }

	          lines[i] = options.indent + lines[i];
	        }
	        result = lines.join('\n');
	      }
	      return result;
	    } else {
	      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
	    }
	  }

	  // Just add water
	  var container = {
	    strict: function strict(obj, name) {
	      if (!(name in obj)) {
	        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
	      }
	      return obj[name];
	    },
	    lookup: function lookup(depths, name) {
	      var len = depths.length;
	      for (var i = 0; i < len; i++) {
	        if (depths[i] && depths[i][name] != null) {
	          return depths[i][name];
	        }
	      }
	    },
	    lambda: function lambda(current, context) {
	      return typeof current === 'function' ? current.call(context) : current;
	    },

	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,

	    fn: function fn(i) {
	      return templateSpec[i];
	    },

	    programs: [],
	    program: function program(i, data, declaredBlockParams, blockParams, depths) {
	      var programWrapper = this.programs[i],
	          fn = this.fn(i);
	      if (data || depths || blockParams || declaredBlockParams) {
	        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
	      }
	      return programWrapper;
	    },

	    data: function data(value, depth) {
	      while (value && depth--) {
	        value = value._parent;
	      }
	      return value;
	    },
	    merge: function merge(param, common) {
	      var obj = param || common;

	      if (param && common && param !== common) {
	        obj = Utils.extend({}, common, param);
	      }

	      return obj;
	    },

	    noop: env.VM.noop,
	    compilerInfo: templateSpec.compiler
	  };

	  function ret(context) {
	    var options = arguments[1] === undefined ? {} : arguments[1];

	    var data = options.data;

	    ret._setup(options);
	    if (!options.partial && templateSpec.useData) {
	      data = initData(context, data);
	    }
	    var depths = undefined,
	        blockParams = templateSpec.useBlockParams ? [] : undefined;
	    if (templateSpec.useDepths) {
	      depths = options.depths ? [context].concat(options.depths) : [context];
	    }

	    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
	  }
	  ret.isTop = true;

	  ret._setup = function (options) {
	    if (!options.partial) {
	      container.helpers = container.merge(options.helpers, env.helpers);

	      if (templateSpec.usePartial) {
	        container.partials = container.merge(options.partials, env.partials);
	      }
	    } else {
	      container.helpers = options.helpers;
	      container.partials = options.partials;
	    }
	  };

	  ret._child = function (i, data, blockParams, depths) {
	    if (templateSpec.useBlockParams && !blockParams) {
	      throw new _Exception2['default']('must pass block params');
	    }
	    if (templateSpec.useDepths && !depths) {
	      throw new _Exception2['default']('must pass parent depths');
	    }

	    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
	  };
	  return ret;
	}

	function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	  function prog(context) {
	    var options = arguments[1] === undefined ? {} : arguments[1];

	    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
	  }
	  prog.program = i;
	  prog.depth = depths ? depths.length : 0;
	  prog.blockParams = declaredBlockParams || 0;
	  return prog;
	}

	function resolvePartial(partial, context, options) {
	  if (!partial) {
	    partial = options.partials[options.name];
	  } else if (!partial.call && !options.name) {
	    // This is a dynamic partial that returned a string
	    options.name = partial;
	    partial = options.partials[partial];
	  }
	  return partial;
	}

	function invokePartial(partial, context, options) {
	  options.partial = true;

	  if (partial === undefined) {
	    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
	  } else if (partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	function noop() {
	  return '';
	}

	function initData(context, data) {
	  if (!data || !('root' in data)) {
	    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
	    data.root = context;
	  }
	  return data;
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;
	/* istanbul ignore next */
	/* Jison generated parser */
	var handlebars = (function () {
	    var parser = { trace: function trace() {},
	        yy: {},
	        symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, content: 12, COMMENT: 13, CONTENT: 14, openRawBlock: 15, END_RAW_BLOCK: 16, OPEN_RAW_BLOCK: 17, helperName: 18, openRawBlock_repetition0: 19, openRawBlock_option0: 20, CLOSE_RAW_BLOCK: 21, openBlock: 22, block_option0: 23, closeBlock: 24, openInverse: 25, block_option1: 26, OPEN_BLOCK: 27, openBlock_repetition0: 28, openBlock_option0: 29, openBlock_option1: 30, CLOSE: 31, OPEN_INVERSE: 32, openInverse_repetition0: 33, openInverse_option0: 34, openInverse_option1: 35, openInverseChain: 36, OPEN_INVERSE_CHAIN: 37, openInverseChain_repetition0: 38, openInverseChain_option0: 39, openInverseChain_option1: 40, inverseAndProgram: 41, INVERSE: 42, inverseChain: 43, inverseChain_option0: 44, OPEN_ENDBLOCK: 45, OPEN: 46, mustache_repetition0: 47, mustache_option0: 48, OPEN_UNESCAPED: 49, mustache_repetition1: 50, mustache_option1: 51, CLOSE_UNESCAPED: 52, OPEN_PARTIAL: 53, partialName: 54, partial_repetition0: 55, partial_option0: 56, param: 57, sexpr: 58, OPEN_SEXPR: 59, sexpr_repetition0: 60, sexpr_option0: 61, CLOSE_SEXPR: 62, hash: 63, hash_repetition_plus0: 64, hashSegment: 65, ID: 66, EQUALS: 67, blockParams: 68, OPEN_BLOCK_PARAMS: 69, blockParams_repetition_plus0: 70, CLOSE_BLOCK_PARAMS: 71, path: 72, dataName: 73, STRING: 74, NUMBER: 75, BOOLEAN: 76, UNDEFINED: 77, NULL: 78, DATA: 79, pathSegments: 80, SEP: 81, $accept: 0, $end: 1 },
	        terminals_: { 2: "error", 5: "EOF", 13: "COMMENT", 14: "CONTENT", 16: "END_RAW_BLOCK", 17: "OPEN_RAW_BLOCK", 21: "CLOSE_RAW_BLOCK", 27: "OPEN_BLOCK", 31: "CLOSE", 32: "OPEN_INVERSE", 37: "OPEN_INVERSE_CHAIN", 42: "INVERSE", 45: "OPEN_ENDBLOCK", 46: "OPEN", 49: "OPEN_UNESCAPED", 52: "CLOSE_UNESCAPED", 53: "OPEN_PARTIAL", 59: "OPEN_SEXPR", 62: "CLOSE_SEXPR", 66: "ID", 67: "EQUALS", 69: "OPEN_BLOCK_PARAMS", 71: "CLOSE_BLOCK_PARAMS", 74: "STRING", 75: "NUMBER", 76: "BOOLEAN", 77: "UNDEFINED", 78: "NULL", 79: "DATA", 81: "SEP" },
	        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [12, 1], [10, 3], [15, 5], [9, 4], [9, 4], [22, 6], [25, 6], [36, 6], [41, 2], [43, 3], [43, 1], [24, 3], [8, 5], [8, 5], [11, 5], [57, 1], [57, 1], [58, 5], [63, 1], [65, 3], [68, 3], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [54, 1], [54, 1], [73, 2], [72, 1], [80, 3], [80, 1], [6, 0], [6, 2], [19, 0], [19, 2], [20, 0], [20, 1], [23, 0], [23, 1], [26, 0], [26, 1], [28, 0], [28, 2], [29, 0], [29, 1], [30, 0], [30, 1], [33, 0], [33, 2], [34, 0], [34, 1], [35, 0], [35, 1], [38, 0], [38, 2], [39, 0], [39, 1], [40, 0], [40, 1], [44, 0], [44, 1], [47, 0], [47, 2], [48, 0], [48, 1], [50, 0], [50, 2], [51, 0], [51, 1], [55, 0], [55, 2], [56, 0], [56, 1], [60, 0], [60, 2], [61, 0], [61, 1], [64, 1], [64, 2], [70, 1], [70, 2]],
	        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {

	            var $0 = $$.length - 1;
	            switch (yystate) {
	                case 1:
	                    return $$[$0 - 1];
	                    break;
	                case 2:
	                    this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));
	                    break;
	                case 3:
	                    this.$ = $$[$0];
	                    break;
	                case 4:
	                    this.$ = $$[$0];
	                    break;
	                case 5:
	                    this.$ = $$[$0];
	                    break;
	                case 6:
	                    this.$ = $$[$0];
	                    break;
	                case 7:
	                    this.$ = $$[$0];
	                    break;
	                case 8:
	                    this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));
	                    break;
	                case 9:
	                    this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));
	                    break;
	                case 10:
	                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
	                    break;
	                case 11:
	                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
	                    break;
	                case 12:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
	                    break;
	                case 13:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
	                    break;
	                case 14:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 15:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 16:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 17:
	                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
	                    break;
	                case 18:
	                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
	                        program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));
	                    program.chained = true;

	                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

	                    break;
	                case 19:
	                    this.$ = $$[$0];
	                    break;
	                case 20:
	                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
	                    break;
	                case 21:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 22:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 23:
	                    this.$ = new yy.PartialStatement($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.stripFlags($$[$0 - 4], $$[$0]), yy.locInfo(this._$));
	                    break;
	                case 24:
	                    this.$ = $$[$0];
	                    break;
	                case 25:
	                    this.$ = $$[$0];
	                    break;
	                case 26:
	                    this.$ = new yy.SubExpression($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.locInfo(this._$));
	                    break;
	                case 27:
	                    this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));
	                    break;
	                case 28:
	                    this.$ = new yy.HashPair(yy.id($$[$0 - 2]), $$[$0], yy.locInfo(this._$));
	                    break;
	                case 29:
	                    this.$ = yy.id($$[$0 - 1]);
	                    break;
	                case 30:
	                    this.$ = $$[$0];
	                    break;
	                case 31:
	                    this.$ = $$[$0];
	                    break;
	                case 32:
	                    this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));
	                    break;
	                case 33:
	                    this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));
	                    break;
	                case 34:
	                    this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));
	                    break;
	                case 35:
	                    this.$ = new yy.UndefinedLiteral(yy.locInfo(this._$));
	                    break;
	                case 36:
	                    this.$ = new yy.NullLiteral(yy.locInfo(this._$));
	                    break;
	                case 37:
	                    this.$ = $$[$0];
	                    break;
	                case 38:
	                    this.$ = $$[$0];
	                    break;
	                case 39:
	                    this.$ = yy.preparePath(true, $$[$0], this._$);
	                    break;
	                case 40:
	                    this.$ = yy.preparePath(false, $$[$0], this._$);
	                    break;
	                case 41:
	                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
	                    break;
	                case 42:
	                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
	                    break;
	                case 43:
	                    this.$ = [];
	                    break;
	                case 44:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 45:
	                    this.$ = [];
	                    break;
	                case 46:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 53:
	                    this.$ = [];
	                    break;
	                case 54:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 59:
	                    this.$ = [];
	                    break;
	                case 60:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 65:
	                    this.$ = [];
	                    break;
	                case 66:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 73:
	                    this.$ = [];
	                    break;
	                case 74:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 77:
	                    this.$ = [];
	                    break;
	                case 78:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 81:
	                    this.$ = [];
	                    break;
	                case 82:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 85:
	                    this.$ = [];
	                    break;
	                case 86:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 89:
	                    this.$ = [$$[$0]];
	                    break;
	                case 90:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 91:
	                    this.$ = [$$[$0]];
	                    break;
	                case 92:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	            }
	        },
	        table: [{ 3: 1, 4: 2, 5: [2, 43], 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: [1, 11], 14: [1, 18], 15: 16, 17: [1, 21], 22: 14, 25: 15, 27: [1, 19], 32: [1, 20], 37: [2, 2], 42: [2, 2], 45: [2, 2], 46: [1, 12], 49: [1, 13], 53: [1, 17] }, { 1: [2, 1] }, { 5: [2, 44], 13: [2, 44], 14: [2, 44], 17: [2, 44], 27: [2, 44], 32: [2, 44], 37: [2, 44], 42: [2, 44], 45: [2, 44], 46: [2, 44], 49: [2, 44], 53: [2, 44] }, { 5: [2, 3], 13: [2, 3], 14: [2, 3], 17: [2, 3], 27: [2, 3], 32: [2, 3], 37: [2, 3], 42: [2, 3], 45: [2, 3], 46: [2, 3], 49: [2, 3], 53: [2, 3] }, { 5: [2, 4], 13: [2, 4], 14: [2, 4], 17: [2, 4], 27: [2, 4], 32: [2, 4], 37: [2, 4], 42: [2, 4], 45: [2, 4], 46: [2, 4], 49: [2, 4], 53: [2, 4] }, { 5: [2, 5], 13: [2, 5], 14: [2, 5], 17: [2, 5], 27: [2, 5], 32: [2, 5], 37: [2, 5], 42: [2, 5], 45: [2, 5], 46: [2, 5], 49: [2, 5], 53: [2, 5] }, { 5: [2, 6], 13: [2, 6], 14: [2, 6], 17: [2, 6], 27: [2, 6], 32: [2, 6], 37: [2, 6], 42: [2, 6], 45: [2, 6], 46: [2, 6], 49: [2, 6], 53: [2, 6] }, { 5: [2, 7], 13: [2, 7], 14: [2, 7], 17: [2, 7], 27: [2, 7], 32: [2, 7], 37: [2, 7], 42: [2, 7], 45: [2, 7], 46: [2, 7], 49: [2, 7], 53: [2, 7] }, { 5: [2, 8], 13: [2, 8], 14: [2, 8], 17: [2, 8], 27: [2, 8], 32: [2, 8], 37: [2, 8], 42: [2, 8], 45: [2, 8], 46: [2, 8], 49: [2, 8], 53: [2, 8] }, { 18: 22, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 33, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 34, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 4: 35, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 12: 36, 14: [1, 18] }, { 18: 38, 54: 37, 58: 39, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 9], 13: [2, 9], 14: [2, 9], 16: [2, 9], 17: [2, 9], 27: [2, 9], 32: [2, 9], 37: [2, 9], 42: [2, 9], 45: [2, 9], 46: [2, 9], 49: [2, 9], 53: [2, 9] }, { 18: 41, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 42, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 43, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [2, 73], 47: 44, 59: [2, 73], 66: [2, 73], 74: [2, 73], 75: [2, 73], 76: [2, 73], 77: [2, 73], 78: [2, 73], 79: [2, 73] }, { 21: [2, 30], 31: [2, 30], 52: [2, 30], 59: [2, 30], 62: [2, 30], 66: [2, 30], 69: [2, 30], 74: [2, 30], 75: [2, 30], 76: [2, 30], 77: [2, 30], 78: [2, 30], 79: [2, 30] }, { 21: [2, 31], 31: [2, 31], 52: [2, 31], 59: [2, 31], 62: [2, 31], 66: [2, 31], 69: [2, 31], 74: [2, 31], 75: [2, 31], 76: [2, 31], 77: [2, 31], 78: [2, 31], 79: [2, 31] }, { 21: [2, 32], 31: [2, 32], 52: [2, 32], 59: [2, 32], 62: [2, 32], 66: [2, 32], 69: [2, 32], 74: [2, 32], 75: [2, 32], 76: [2, 32], 77: [2, 32], 78: [2, 32], 79: [2, 32] }, { 21: [2, 33], 31: [2, 33], 52: [2, 33], 59: [2, 33], 62: [2, 33], 66: [2, 33], 69: [2, 33], 74: [2, 33], 75: [2, 33], 76: [2, 33], 77: [2, 33], 78: [2, 33], 79: [2, 33] }, { 21: [2, 34], 31: [2, 34], 52: [2, 34], 59: [2, 34], 62: [2, 34], 66: [2, 34], 69: [2, 34], 74: [2, 34], 75: [2, 34], 76: [2, 34], 77: [2, 34], 78: [2, 34], 79: [2, 34] }, { 21: [2, 35], 31: [2, 35], 52: [2, 35], 59: [2, 35], 62: [2, 35], 66: [2, 35], 69: [2, 35], 74: [2, 35], 75: [2, 35], 76: [2, 35], 77: [2, 35], 78: [2, 35], 79: [2, 35] }, { 21: [2, 36], 31: [2, 36], 52: [2, 36], 59: [2, 36], 62: [2, 36], 66: [2, 36], 69: [2, 36], 74: [2, 36], 75: [2, 36], 76: [2, 36], 77: [2, 36], 78: [2, 36], 79: [2, 36] }, { 21: [2, 40], 31: [2, 40], 52: [2, 40], 59: [2, 40], 62: [2, 40], 66: [2, 40], 69: [2, 40], 74: [2, 40], 75: [2, 40], 76: [2, 40], 77: [2, 40], 78: [2, 40], 79: [2, 40], 81: [1, 45] }, { 66: [1, 32], 80: 46 }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 50: 47, 52: [2, 77], 59: [2, 77], 66: [2, 77], 74: [2, 77], 75: [2, 77], 76: [2, 77], 77: [2, 77], 78: [2, 77], 79: [2, 77] }, { 23: 48, 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 49, 45: [2, 49] }, { 26: 54, 41: 55, 42: [1, 53], 45: [2, 51] }, { 16: [1, 56] }, { 31: [2, 81], 55: 57, 59: [2, 81], 66: [2, 81], 74: [2, 81], 75: [2, 81], 76: [2, 81], 77: [2, 81], 78: [2, 81], 79: [2, 81] }, { 31: [2, 37], 59: [2, 37], 66: [2, 37], 74: [2, 37], 75: [2, 37], 76: [2, 37], 77: [2, 37], 78: [2, 37], 79: [2, 37] }, { 31: [2, 38], 59: [2, 38], 66: [2, 38], 74: [2, 38], 75: [2, 38], 76: [2, 38], 77: [2, 38], 78: [2, 38], 79: [2, 38] }, { 18: 58, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 28: 59, 31: [2, 53], 59: [2, 53], 66: [2, 53], 69: [2, 53], 74: [2, 53], 75: [2, 53], 76: [2, 53], 77: [2, 53], 78: [2, 53], 79: [2, 53] }, { 31: [2, 59], 33: 60, 59: [2, 59], 66: [2, 59], 69: [2, 59], 74: [2, 59], 75: [2, 59], 76: [2, 59], 77: [2, 59], 78: [2, 59], 79: [2, 59] }, { 19: 61, 21: [2, 45], 59: [2, 45], 66: [2, 45], 74: [2, 45], 75: [2, 45], 76: [2, 45], 77: [2, 45], 78: [2, 45], 79: [2, 45] }, { 18: 65, 31: [2, 75], 48: 62, 57: 63, 58: 66, 59: [1, 40], 63: 64, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 66: [1, 70] }, { 21: [2, 39], 31: [2, 39], 52: [2, 39], 59: [2, 39], 62: [2, 39], 66: [2, 39], 69: [2, 39], 74: [2, 39], 75: [2, 39], 76: [2, 39], 77: [2, 39], 78: [2, 39], 79: [2, 39], 81: [1, 45] }, { 18: 65, 51: 71, 52: [2, 79], 57: 72, 58: 66, 59: [1, 40], 63: 73, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 24: 74, 45: [1, 75] }, { 45: [2, 50] }, { 4: 76, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 45: [2, 19] }, { 18: 77, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 78, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 24: 79, 45: [1, 75] }, { 45: [2, 52] }, { 5: [2, 10], 13: [2, 10], 14: [2, 10], 17: [2, 10], 27: [2, 10], 32: [2, 10], 37: [2, 10], 42: [2, 10], 45: [2, 10], 46: [2, 10], 49: [2, 10], 53: [2, 10] }, { 18: 65, 31: [2, 83], 56: 80, 57: 81, 58: 66, 59: [1, 40], 63: 82, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 59: [2, 85], 60: 83, 62: [2, 85], 66: [2, 85], 74: [2, 85], 75: [2, 85], 76: [2, 85], 77: [2, 85], 78: [2, 85], 79: [2, 85] }, { 18: 65, 29: 84, 31: [2, 55], 57: 85, 58: 66, 59: [1, 40], 63: 86, 64: 67, 65: 68, 66: [1, 69], 69: [2, 55], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 31: [2, 61], 34: 87, 57: 88, 58: 66, 59: [1, 40], 63: 89, 64: 67, 65: 68, 66: [1, 69], 69: [2, 61], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 20: 90, 21: [2, 47], 57: 91, 58: 66, 59: [1, 40], 63: 92, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [1, 93] }, { 31: [2, 74], 59: [2, 74], 66: [2, 74], 74: [2, 74], 75: [2, 74], 76: [2, 74], 77: [2, 74], 78: [2, 74], 79: [2, 74] }, { 31: [2, 76] }, { 21: [2, 24], 31: [2, 24], 52: [2, 24], 59: [2, 24], 62: [2, 24], 66: [2, 24], 69: [2, 24], 74: [2, 24], 75: [2, 24], 76: [2, 24], 77: [2, 24], 78: [2, 24], 79: [2, 24] }, { 21: [2, 25], 31: [2, 25], 52: [2, 25], 59: [2, 25], 62: [2, 25], 66: [2, 25], 69: [2, 25], 74: [2, 25], 75: [2, 25], 76: [2, 25], 77: [2, 25], 78: [2, 25], 79: [2, 25] }, { 21: [2, 27], 31: [2, 27], 52: [2, 27], 62: [2, 27], 65: 94, 66: [1, 95], 69: [2, 27] }, { 21: [2, 89], 31: [2, 89], 52: [2, 89], 62: [2, 89], 66: [2, 89], 69: [2, 89] }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 67: [1, 96], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 21: [2, 41], 31: [2, 41], 52: [2, 41], 59: [2, 41], 62: [2, 41], 66: [2, 41], 69: [2, 41], 74: [2, 41], 75: [2, 41], 76: [2, 41], 77: [2, 41], 78: [2, 41], 79: [2, 41], 81: [2, 41] }, { 52: [1, 97] }, { 52: [2, 78], 59: [2, 78], 66: [2, 78], 74: [2, 78], 75: [2, 78], 76: [2, 78], 77: [2, 78], 78: [2, 78], 79: [2, 78] }, { 52: [2, 80] }, { 5: [2, 12], 13: [2, 12], 14: [2, 12], 17: [2, 12], 27: [2, 12], 32: [2, 12], 37: [2, 12], 42: [2, 12], 45: [2, 12], 46: [2, 12], 49: [2, 12], 53: [2, 12] }, { 18: 98, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 100, 44: 99, 45: [2, 71] }, { 31: [2, 65], 38: 101, 59: [2, 65], 66: [2, 65], 69: [2, 65], 74: [2, 65], 75: [2, 65], 76: [2, 65], 77: [2, 65], 78: [2, 65], 79: [2, 65] }, { 45: [2, 17] }, { 5: [2, 13], 13: [2, 13], 14: [2, 13], 17: [2, 13], 27: [2, 13], 32: [2, 13], 37: [2, 13], 42: [2, 13], 45: [2, 13], 46: [2, 13], 49: [2, 13], 53: [2, 13] }, { 31: [1, 102] }, { 31: [2, 82], 59: [2, 82], 66: [2, 82], 74: [2, 82], 75: [2, 82], 76: [2, 82], 77: [2, 82], 78: [2, 82], 79: [2, 82] }, { 31: [2, 84] }, { 18: 65, 57: 104, 58: 66, 59: [1, 40], 61: 103, 62: [2, 87], 63: 105, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 30: 106, 31: [2, 57], 68: 107, 69: [1, 108] }, { 31: [2, 54], 59: [2, 54], 66: [2, 54], 69: [2, 54], 74: [2, 54], 75: [2, 54], 76: [2, 54], 77: [2, 54], 78: [2, 54], 79: [2, 54] }, { 31: [2, 56], 69: [2, 56] }, { 31: [2, 63], 35: 109, 68: 110, 69: [1, 108] }, { 31: [2, 60], 59: [2, 60], 66: [2, 60], 69: [2, 60], 74: [2, 60], 75: [2, 60], 76: [2, 60], 77: [2, 60], 78: [2, 60], 79: [2, 60] }, { 31: [2, 62], 69: [2, 62] }, { 21: [1, 111] }, { 21: [2, 46], 59: [2, 46], 66: [2, 46], 74: [2, 46], 75: [2, 46], 76: [2, 46], 77: [2, 46], 78: [2, 46], 79: [2, 46] }, { 21: [2, 48] }, { 5: [2, 21], 13: [2, 21], 14: [2, 21], 17: [2, 21], 27: [2, 21], 32: [2, 21], 37: [2, 21], 42: [2, 21], 45: [2, 21], 46: [2, 21], 49: [2, 21], 53: [2, 21] }, { 21: [2, 90], 31: [2, 90], 52: [2, 90], 62: [2, 90], 66: [2, 90], 69: [2, 90] }, { 67: [1, 96] }, { 18: 65, 57: 112, 58: 66, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 22], 13: [2, 22], 14: [2, 22], 17: [2, 22], 27: [2, 22], 32: [2, 22], 37: [2, 22], 42: [2, 22], 45: [2, 22], 46: [2, 22], 49: [2, 22], 53: [2, 22] }, { 31: [1, 113] }, { 45: [2, 18] }, { 45: [2, 72] }, { 18: 65, 31: [2, 67], 39: 114, 57: 115, 58: 66, 59: [1, 40], 63: 116, 64: 67, 65: 68, 66: [1, 69], 69: [2, 67], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 23], 13: [2, 23], 14: [2, 23], 17: [2, 23], 27: [2, 23], 32: [2, 23], 37: [2, 23], 42: [2, 23], 45: [2, 23], 46: [2, 23], 49: [2, 23], 53: [2, 23] }, { 62: [1, 117] }, { 59: [2, 86], 62: [2, 86], 66: [2, 86], 74: [2, 86], 75: [2, 86], 76: [2, 86], 77: [2, 86], 78: [2, 86], 79: [2, 86] }, { 62: [2, 88] }, { 31: [1, 118] }, { 31: [2, 58] }, { 66: [1, 120], 70: 119 }, { 31: [1, 121] }, { 31: [2, 64] }, { 14: [2, 11] }, { 21: [2, 28], 31: [2, 28], 52: [2, 28], 62: [2, 28], 66: [2, 28], 69: [2, 28] }, { 5: [2, 20], 13: [2, 20], 14: [2, 20], 17: [2, 20], 27: [2, 20], 32: [2, 20], 37: [2, 20], 42: [2, 20], 45: [2, 20], 46: [2, 20], 49: [2, 20], 53: [2, 20] }, { 31: [2, 69], 40: 122, 68: 123, 69: [1, 108] }, { 31: [2, 66], 59: [2, 66], 66: [2, 66], 69: [2, 66], 74: [2, 66], 75: [2, 66], 76: [2, 66], 77: [2, 66], 78: [2, 66], 79: [2, 66] }, { 31: [2, 68], 69: [2, 68] }, { 21: [2, 26], 31: [2, 26], 52: [2, 26], 59: [2, 26], 62: [2, 26], 66: [2, 26], 69: [2, 26], 74: [2, 26], 75: [2, 26], 76: [2, 26], 77: [2, 26], 78: [2, 26], 79: [2, 26] }, { 13: [2, 14], 14: [2, 14], 17: [2, 14], 27: [2, 14], 32: [2, 14], 37: [2, 14], 42: [2, 14], 45: [2, 14], 46: [2, 14], 49: [2, 14], 53: [2, 14] }, { 66: [1, 125], 71: [1, 124] }, { 66: [2, 91], 71: [2, 91] }, { 13: [2, 15], 14: [2, 15], 17: [2, 15], 27: [2, 15], 32: [2, 15], 42: [2, 15], 45: [2, 15], 46: [2, 15], 49: [2, 15], 53: [2, 15] }, { 31: [1, 126] }, { 31: [2, 70] }, { 31: [2, 29] }, { 66: [2, 92], 71: [2, 92] }, { 13: [2, 16], 14: [2, 16], 17: [2, 16], 27: [2, 16], 32: [2, 16], 37: [2, 16], 42: [2, 16], 45: [2, 16], 46: [2, 16], 49: [2, 16], 53: [2, 16] }],
	        defaultActions: { 4: [2, 1], 49: [2, 50], 51: [2, 19], 55: [2, 52], 64: [2, 76], 73: [2, 80], 78: [2, 17], 82: [2, 84], 92: [2, 48], 99: [2, 18], 100: [2, 72], 105: [2, 88], 107: [2, 58], 110: [2, 64], 111: [2, 11], 123: [2, 70], 124: [2, 29] },
	        parseError: function parseError(str, hash) {
	            throw new Error(str);
	        },
	        parse: function parse(input) {
	            var self = this,
	                stack = [0],
	                vstack = [null],
	                lstack = [],
	                table = this.table,
	                yytext = "",
	                yylineno = 0,
	                yyleng = 0,
	                recovering = 0,
	                TERROR = 2,
	                EOF = 1;
	            this.lexer.setInput(input);
	            this.lexer.yy = this.yy;
	            this.yy.lexer = this.lexer;
	            this.yy.parser = this;
	            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
	            var yyloc = this.lexer.yylloc;
	            lstack.push(yyloc);
	            var ranges = this.lexer.options && this.lexer.options.ranges;
	            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
	            function popStack(n) {
	                stack.length = stack.length - 2 * n;
	                vstack.length = vstack.length - n;
	                lstack.length = lstack.length - n;
	            }
	            function lex() {
	                var token;
	                token = self.lexer.lex() || 1;
	                if (typeof token !== "number") {
	                    token = self.symbols_[token] || token;
	                }
	                return token;
	            }
	            var symbol,
	                preErrorSymbol,
	                state,
	                action,
	                a,
	                r,
	                yyval = {},
	                p,
	                len,
	                newState,
	                expected;
	            while (true) {
	                state = stack[stack.length - 1];
	                if (this.defaultActions[state]) {
	                    action = this.defaultActions[state];
	                } else {
	                    if (symbol === null || typeof symbol == "undefined") {
	                        symbol = lex();
	                    }
	                    action = table[state] && table[state][symbol];
	                }
	                if (typeof action === "undefined" || !action.length || !action[0]) {
	                    var errStr = "";
	                    if (!recovering) {
	                        expected = [];
	                        for (p in table[state]) if (this.terminals_[p] && p > 2) {
	                            expected.push("'" + this.terminals_[p] + "'");
	                        }
	                        if (this.lexer.showPosition) {
	                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
	                        } else {
	                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
	                        }
	                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
	                    }
	                }
	                if (action[0] instanceof Array && action.length > 1) {
	                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
	                }
	                switch (action[0]) {
	                    case 1:
	                        stack.push(symbol);
	                        vstack.push(this.lexer.yytext);
	                        lstack.push(this.lexer.yylloc);
	                        stack.push(action[1]);
	                        symbol = null;
	                        if (!preErrorSymbol) {
	                            yyleng = this.lexer.yyleng;
	                            yytext = this.lexer.yytext;
	                            yylineno = this.lexer.yylineno;
	                            yyloc = this.lexer.yylloc;
	                            if (recovering > 0) recovering--;
	                        } else {
	                            symbol = preErrorSymbol;
	                            preErrorSymbol = null;
	                        }
	                        break;
	                    case 2:
	                        len = this.productions_[action[1]][1];
	                        yyval.$ = vstack[vstack.length - len];
	                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
	                        if (ranges) {
	                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	                        }
	                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
	                        if (typeof r !== "undefined") {
	                            return r;
	                        }
	                        if (len) {
	                            stack = stack.slice(0, -1 * len * 2);
	                            vstack = vstack.slice(0, -1 * len);
	                            lstack = lstack.slice(0, -1 * len);
	                        }
	                        stack.push(this.productions_[action[1]][0]);
	                        vstack.push(yyval.$);
	                        lstack.push(yyval._$);
	                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	                        stack.push(newState);
	                        break;
	                    case 3:
	                        return true;
	                }
	            }
	            return true;
	        }
	    };
	    /* Jison generated lexer */
	    var lexer = (function () {
	        var lexer = { EOF: 1,
	            parseError: function parseError(str, hash) {
	                if (this.yy.parser) {
	                    this.yy.parser.parseError(str, hash);
	                } else {
	                    throw new Error(str);
	                }
	            },
	            setInput: function setInput(input) {
	                this._input = input;
	                this._more = this._less = this.done = false;
	                this.yylineno = this.yyleng = 0;
	                this.yytext = this.matched = this.match = "";
	                this.conditionStack = ["INITIAL"];
	                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
	                if (this.options.ranges) this.yylloc.range = [0, 0];
	                this.offset = 0;
	                return this;
	            },
	            input: function input() {
	                var ch = this._input[0];
	                this.yytext += ch;
	                this.yyleng++;
	                this.offset++;
	                this.match += ch;
	                this.matched += ch;
	                var lines = ch.match(/(?:\r\n?|\n).*/g);
	                if (lines) {
	                    this.yylineno++;
	                    this.yylloc.last_line++;
	                } else {
	                    this.yylloc.last_column++;
	                }
	                if (this.options.ranges) this.yylloc.range[1]++;

	                this._input = this._input.slice(1);
	                return ch;
	            },
	            unput: function unput(ch) {
	                var len = ch.length;
	                var lines = ch.split(/(?:\r\n?|\n)/g);

	                this._input = ch + this._input;
	                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
	                //this.yyleng -= len;
	                this.offset -= len;
	                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	                this.match = this.match.substr(0, this.match.length - 1);
	                this.matched = this.matched.substr(0, this.matched.length - 1);

	                if (lines.length - 1) this.yylineno -= lines.length - 1;
	                var r = this.yylloc.range;

	                this.yylloc = { first_line: this.yylloc.first_line,
	                    last_line: this.yylineno + 1,
	                    first_column: this.yylloc.first_column,
	                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
	                };

	                if (this.options.ranges) {
	                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	                }
	                return this;
	            },
	            more: function more() {
	                this._more = true;
	                return this;
	            },
	            less: function less(n) {
	                this.unput(this.match.slice(n));
	            },
	            pastInput: function pastInput() {
	                var past = this.matched.substr(0, this.matched.length - this.match.length);
	                return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
	            },
	            upcomingInput: function upcomingInput() {
	                var next = this.match;
	                if (next.length < 20) {
	                    next += this._input.substr(0, 20 - next.length);
	                }
	                return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
	            },
	            showPosition: function showPosition() {
	                var pre = this.pastInput();
	                var c = new Array(pre.length + 1).join("-");
	                return pre + this.upcomingInput() + "\n" + c + "^";
	            },
	            next: function next() {
	                if (this.done) {
	                    return this.EOF;
	                }
	                if (!this._input) this.done = true;

	                var token, match, tempMatch, index, col, lines;
	                if (!this._more) {
	                    this.yytext = "";
	                    this.match = "";
	                }
	                var rules = this._currentRules();
	                for (var i = 0; i < rules.length; i++) {
	                    tempMatch = this._input.match(this.rules[rules[i]]);
	                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                        match = tempMatch;
	                        index = i;
	                        if (!this.options.flex) break;
	                    }
	                }
	                if (match) {
	                    lines = match[0].match(/(?:\r\n?|\n).*/g);
	                    if (lines) this.yylineno += lines.length;
	                    this.yylloc = { first_line: this.yylloc.last_line,
	                        last_line: this.yylineno + 1,
	                        first_column: this.yylloc.last_column,
	                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
	                    this.yytext += match[0];
	                    this.match += match[0];
	                    this.matches = match;
	                    this.yyleng = this.yytext.length;
	                    if (this.options.ranges) {
	                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
	                    }
	                    this._more = false;
	                    this._input = this._input.slice(match[0].length);
	                    this.matched += match[0];
	                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
	                    if (this.done && this._input) this.done = false;
	                    if (token) {
	                        return token;
	                    } else {
	                        return;
	                    }
	                }
	                if (this._input === "") {
	                    return this.EOF;
	                } else {
	                    return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), { text: "", token: null, line: this.yylineno });
	                }
	            },
	            lex: function lex() {
	                var r = this.next();
	                if (typeof r !== "undefined") {
	                    return r;
	                } else {
	                    return this.lex();
	                }
	            },
	            begin: function begin(condition) {
	                this.conditionStack.push(condition);
	            },
	            popState: function popState() {
	                return this.conditionStack.pop();
	            },
	            _currentRules: function _currentRules() {
	                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	            },
	            topState: function topState() {
	                return this.conditionStack[this.conditionStack.length - 2];
	            },
	            pushState: function begin(condition) {
	                this.begin(condition);
	            } };
	        lexer.options = {};
	        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {

	            function strip(start, end) {
	                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
	            }

	            var YYSTATE = YY_START;
	            switch ($avoiding_name_collisions) {
	                case 0:
	                    if (yy_.yytext.slice(-2) === "\\\\") {
	                        strip(0, 1);
	                        this.begin("mu");
	                    } else if (yy_.yytext.slice(-1) === "\\") {
	                        strip(0, 1);
	                        this.begin("emu");
	                    } else {
	                        this.begin("mu");
	                    }
	                    if (yy_.yytext) {
	                        return 14;
	                    }break;
	                case 1:
	                    return 14;
	                    break;
	                case 2:
	                    this.popState();
	                    return 14;

	                    break;
	                case 3:
	                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
	                    this.popState();
	                    return 16;

	                    break;
	                case 4:
	                    return 14;
	                    break;
	                case 5:
	                    this.popState();
	                    return 13;

	                    break;
	                case 6:
	                    return 59;
	                    break;
	                case 7:
	                    return 62;
	                    break;
	                case 8:
	                    return 17;
	                    break;
	                case 9:
	                    this.popState();
	                    this.begin("raw");
	                    return 21;

	                    break;
	                case 10:
	                    return 53;
	                    break;
	                case 11:
	                    return 27;
	                    break;
	                case 12:
	                    return 45;
	                    break;
	                case 13:
	                    this.popState();return 42;
	                    break;
	                case 14:
	                    this.popState();return 42;
	                    break;
	                case 15:
	                    return 32;
	                    break;
	                case 16:
	                    return 37;
	                    break;
	                case 17:
	                    return 49;
	                    break;
	                case 18:
	                    return 46;
	                    break;
	                case 19:
	                    this.unput(yy_.yytext);
	                    this.popState();
	                    this.begin("com");

	                    break;
	                case 20:
	                    this.popState();
	                    return 13;

	                    break;
	                case 21:
	                    return 46;
	                    break;
	                case 22:
	                    return 67;
	                    break;
	                case 23:
	                    return 66;
	                    break;
	                case 24:
	                    return 66;
	                    break;
	                case 25:
	                    return 81;
	                    break;
	                case 26:
	                    // ignore whitespace
	                    break;
	                case 27:
	                    this.popState();return 52;
	                    break;
	                case 28:
	                    this.popState();return 31;
	                    break;
	                case 29:
	                    yy_.yytext = strip(1, 2).replace(/\\"/g, "\"");return 74;
	                    break;
	                case 30:
	                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 74;
	                    break;
	                case 31:
	                    return 79;
	                    break;
	                case 32:
	                    return 76;
	                    break;
	                case 33:
	                    return 76;
	                    break;
	                case 34:
	                    return 77;
	                    break;
	                case 35:
	                    return 78;
	                    break;
	                case 36:
	                    return 75;
	                    break;
	                case 37:
	                    return 69;
	                    break;
	                case 38:
	                    return 71;
	                    break;
	                case 39:
	                    return 66;
	                    break;
	                case 40:
	                    return 66;
	                    break;
	                case 41:
	                    return "INVALID";
	                    break;
	                case 42:
	                    return 5;
	                    break;
	            }
	        };
	        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/];
	        lexer.conditions = { mu: { rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], inclusive: false }, emu: { rules: [2], inclusive: false }, com: { rules: [5], inclusive: false }, raw: { rules: [3, 4], inclusive: false }, INITIAL: { rules: [0, 1, 42], inclusive: true } };
	        return lexer;
	    })();
	    parser.lexer = lexer;
	    function Parser() {
	        this.yy = {};
	    }Parser.prototype = parser;parser.Parser = Parser;
	    return new Parser();
	})();exports["default"] = handlebars;
	module.exports = exports["default"];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;

	var _Visitor = __webpack_require__(6);

	var _Visitor2 = _interopRequireWildcard(_Visitor);

	function WhitespaceControl() {}
	WhitespaceControl.prototype = new _Visitor2['default']();

	WhitespaceControl.prototype.Program = function (program) {
	  var isRoot = !this.isRootSeen;
	  this.isRootSeen = true;

	  var body = program.body;
	  for (var i = 0, l = body.length; i < l; i++) {
	    var current = body[i],
	        strip = this.accept(current);

	    if (!strip) {
	      continue;
	    }

	    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
	        _isNextWhitespace = isNextWhitespace(body, i, isRoot),
	        openStandalone = strip.openStandalone && _isPrevWhitespace,
	        closeStandalone = strip.closeStandalone && _isNextWhitespace,
	        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

	    if (strip.close) {
	      omitRight(body, i, true);
	    }
	    if (strip.open) {
	      omitLeft(body, i, true);
	    }

	    if (inlineStandalone) {
	      omitRight(body, i);

	      if (omitLeft(body, i)) {
	        // If we are on a standalone node, save the indent info for partials
	        if (current.type === 'PartialStatement') {
	          // Pull out the whitespace from the final line
	          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
	        }
	      }
	    }
	    if (openStandalone) {
	      omitRight((current.program || current.inverse).body);

	      // Strip out the previous content node if it's whitespace only
	      omitLeft(body, i);
	    }
	    if (closeStandalone) {
	      // Always strip the next node
	      omitRight(body, i);

	      omitLeft((current.inverse || current.program).body);
	    }
	  }

	  return program;
	};
	WhitespaceControl.prototype.BlockStatement = function (block) {
	  this.accept(block.program);
	  this.accept(block.inverse);

	  // Find the inverse program that is involed with whitespace stripping.
	  var program = block.program || block.inverse,
	      inverse = block.program && block.inverse,
	      firstInverse = inverse,
	      lastInverse = inverse;

	  if (inverse && inverse.chained) {
	    firstInverse = inverse.body[0].program;

	    // Walk the inverse chain to find the last inverse that is actually in the chain.
	    while (lastInverse.chained) {
	      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
	    }
	  }

	  var strip = {
	    open: block.openStrip.open,
	    close: block.closeStrip.close,

	    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
	    // so our parent can determine if we actually are standalone
	    openStandalone: isNextWhitespace(program.body),
	    closeStandalone: isPrevWhitespace((firstInverse || program).body)
	  };

	  if (block.openStrip.close) {
	    omitRight(program.body, null, true);
	  }

	  if (inverse) {
	    var inverseStrip = block.inverseStrip;

	    if (inverseStrip.open) {
	      omitLeft(program.body, null, true);
	    }

	    if (inverseStrip.close) {
	      omitRight(firstInverse.body, null, true);
	    }
	    if (block.closeStrip.open) {
	      omitLeft(lastInverse.body, null, true);
	    }

	    // Find standalone else statments
	    if (isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
	      omitLeft(program.body);
	      omitRight(firstInverse.body);
	    }
	  } else if (block.closeStrip.open) {
	    omitLeft(program.body, null, true);
	  }

	  return strip;
	};

	WhitespaceControl.prototype.MustacheStatement = function (mustache) {
	  return mustache.strip;
	};

	WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
	  /* istanbul ignore next */
	  var strip = node.strip || {};
	  return {
	    inlineStandalone: true,
	    open: strip.open,
	    close: strip.close
	  };
	};

	function isPrevWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = body.length;
	  }

	  // Nodes that end with newlines are considered whitespace (but are special
	  // cased for strip operations)
	  var prev = body[i - 1],
	      sibling = body[i - 2];
	  if (!prev) {
	    return isRoot;
	  }

	  if (prev.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
	  }
	}
	function isNextWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = -1;
	  }

	  var next = body[i + 1],
	      sibling = body[i + 2];
	  if (!next) {
	    return isRoot;
	  }

	  if (next.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
	  }
	}

	// Marks the node to the right of the position as omitted.
	// I.e. {{foo}}' ' will mark the ' ' node as omitted.
	//
	// If i is undefined, then the first child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitRight(body, i, multiple) {
	  var current = body[i == null ? 0 : i + 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
	    return;
	  }

	  var original = current.value;
	  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
	  current.rightStripped = current.value !== original;
	}

	// Marks the node to the left of the position as omitted.
	// I.e. ' '{{foo}} will mark the ' ' node as omitted.
	//
	// If i is undefined then the last child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitLeft(body, i, multiple) {
	  var current = body[i == null ? body.length - 1 : i - 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
	    return;
	  }

	  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
	  var original = current.value;
	  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
	  current.leftStripped = current.value !== original;
	  return current.leftStripped;
	}

	exports['default'] = WhitespaceControl;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(8)['default'];

	exports.__esModule = true;
	exports.SourceLocation = SourceLocation;
	exports.id = id;
	exports.stripFlags = stripFlags;
	exports.stripComment = stripComment;
	exports.preparePath = preparePath;
	exports.prepareMustache = prepareMustache;
	exports.prepareRawBlock = prepareRawBlock;
	exports.prepareBlock = prepareBlock;

	var _Exception = __webpack_require__(11);

	var _Exception2 = _interopRequireWildcard(_Exception);

	function SourceLocation(source, locInfo) {
	  this.source = source;
	  this.start = {
	    line: locInfo.first_line,
	    column: locInfo.first_column
	  };
	  this.end = {
	    line: locInfo.last_line,
	    column: locInfo.last_column
	  };
	}

	function id(token) {
	  if (/^\[.*\]$/.test(token)) {
	    return token.substr(1, token.length - 2);
	  } else {
	    return token;
	  }
	}

	function stripFlags(open, close) {
	  return {
	    open: open.charAt(2) === '~',
	    close: close.charAt(close.length - 3) === '~'
	  };
	}

	function stripComment(comment) {
	  return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
	}

	function preparePath(data, parts, locInfo) {
	  locInfo = this.locInfo(locInfo);

	  var original = data ? '@' : '',
	      dig = [],
	      depth = 0,
	      depthString = '';

	  for (var i = 0, l = parts.length; i < l; i++) {
	    var part = parts[i].part,

	    // If we have [] syntax then we do not treat path references as operators,
	    // i.e. foo.[this] resolves to approximately context.foo['this']
	    isLiteral = parts[i].original !== part;
	    original += (parts[i].separator || '') + part;

	    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
	      if (dig.length > 0) {
	        throw new _Exception2['default']('Invalid path: ' + original, { loc: locInfo });
	      } else if (part === '..') {
	        depth++;
	        depthString += '../';
	      }
	    } else {
	      dig.push(part);
	    }
	  }

	  return new this.PathExpression(data, depth, dig, original, locInfo);
	}

	function prepareMustache(path, params, hash, open, strip, locInfo) {
	  // Must use charAt to support IE pre-10
	  var escapeFlag = open.charAt(3) || open.charAt(2),
	      escaped = escapeFlag !== '{' && escapeFlag !== '&';

	  return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
	}

	function prepareRawBlock(openRawBlock, content, close, locInfo) {
	  if (openRawBlock.path.original !== close) {
	    var errorNode = { loc: openRawBlock.path.loc };

	    throw new _Exception2['default'](openRawBlock.path.original + ' doesn\'t match ' + close, errorNode);
	  }

	  locInfo = this.locInfo(locInfo);
	  var program = new this.Program([content], null, {}, locInfo);

	  return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);
	}

	function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
	  // When we are chaining inverse calls, we will not have a close path
	  if (close && close.path && openBlock.path.original !== close.path.original) {
	    var errorNode = { loc: openBlock.path.loc };

	    throw new _Exception2['default'](openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
	  }

	  program.blockParams = openBlock.blockParams;

	  var inverse = undefined,
	      inverseStrip = undefined;

	  if (inverseAndProgram) {
	    if (inverseAndProgram.chain) {
	      inverseAndProgram.program.body[0].closeStrip = close.strip;
	    }

	    inverseStrip = inverseAndProgram.strip;
	    inverse = inverseAndProgram.program;
	  }

	  if (inverted) {
	    inverted = inverse;
	    inverse = program;
	    program = inverted;
	  }

	  return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	/*global define */

	var _isArray = __webpack_require__(12);

	var SourceNode = undefined;

	try {
	  /* istanbul ignore next */
	  if (false) {
	    // We don't support this in AMD environments. For these environments, we asusme that
	    // they are running on the browser and thus have no need for the source-map library.
	    var SourceMap = require('source-map');
	    SourceNode = SourceMap.SourceNode;
	  }
	} catch (err) {}

	/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
	if (!SourceNode) {
	  SourceNode = function (line, column, srcFile, chunks) {
	    this.src = '';
	    if (chunks) {
	      this.add(chunks);
	    }
	  };
	  /* istanbul ignore next */
	  SourceNode.prototype = {
	    add: function add(chunks) {
	      if (_isArray.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src += chunks;
	    },
	    prepend: function prepend(chunks) {
	      if (_isArray.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src = chunks + this.src;
	    },
	    toStringWithSourceMap: function toStringWithSourceMap() {
	      return { code: this.toString() };
	    },
	    toString: function toString() {
	      return this.src;
	    }
	  };
	}

	function castChunk(chunk, codeGen, loc) {
	  if (_isArray.isArray(chunk)) {
	    var ret = [];

	    for (var i = 0, len = chunk.length; i < len; i++) {
	      ret.push(codeGen.wrap(chunk[i], loc));
	    }
	    return ret;
	  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
	    // Handle primitives that the SourceNode will throw up on
	    return chunk + '';
	  }
	  return chunk;
	}

	function CodeGen(srcFile) {
	  this.srcFile = srcFile;
	  this.source = [];
	}

	CodeGen.prototype = {
	  prepend: function prepend(source, loc) {
	    this.source.unshift(this.wrap(source, loc));
	  },
	  push: function push(source, loc) {
	    this.source.push(this.wrap(source, loc));
	  },

	  merge: function merge() {
	    var source = this.empty();
	    this.each(function (line) {
	      source.add(['  ', line, '\n']);
	    });
	    return source;
	  },

	  each: function each(iter) {
	    for (var i = 0, len = this.source.length; i < len; i++) {
	      iter(this.source[i]);
	    }
	  },

	  empty: function empty() {
	    var loc = arguments[0] === undefined ? this.currentLocation || { start: {} } : arguments[0];

	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
	  },
	  wrap: function wrap(chunk) {
	    var loc = arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

	    if (chunk instanceof SourceNode) {
	      return chunk;
	    }

	    chunk = castChunk(chunk, this, loc);

	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
	  },

	  functionCall: function functionCall(fn, type, params) {
	    params = this.generateList(params);
	    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
	  },

	  quotedString: function quotedString(str) {
	    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
	    .replace(/\u2029/g, '\\u2029') + '"';
	  },

	  objectLiteral: function objectLiteral(obj) {
	    var pairs = [];

	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        var value = castChunk(obj[key], this);
	        if (value !== 'undefined') {
	          pairs.push([this.quotedString(key), ':', value]);
	        }
	      }
	    }

	    var ret = this.generateList(pairs);
	    ret.prepend('{');
	    ret.add('}');
	    return ret;
	  },

	  generateList: function generateList(entries, loc) {
	    var ret = this.empty(loc);

	    for (var i = 0, len = entries.length; i < len; i++) {
	      if (i) {
	        ret.add(',');
	      }

	      ret.add(castChunk(entries[i], this, loc));
	    }

	    return ret;
	  },

	  generateArray: function generateArray(entries, loc) {
	    var ret = this.generateList(entries, loc);
	    ret.prepend('[');
	    ret.add(']');

	    return ret;
	  }
	};

	exports['default'] = CodeGen;
	module.exports = exports['default'];

	/* NOP */

/***/ }
/******/ ])
});
;
csui.define('csui/lib/i18nprecompile',['module', 'csui/lib/handlebars', "csui/lib/underscore"], function ( module, Handlebars, _ ) {

  function replaceLocaleStrings ( ast, mapping, options ) {
    options = options || {};
    mapping = mapping || {};
    // Base set of things
    if ( ast && ast.type === "program" && ast.statements ) {
      _(ast.statements).forEach(function(statement, i){
        var newString = "<!-- i18n error -->";
        // If it's a translation node
        if ( statement.type === "mustache" && statement.id && statement.id.original === "$" ) {

          if ( statement.params.length && statement.params[0].string ) {
            var key = statement.params[0].string;
            newString = mapping[ key ] || (options.originalKeyFallback ? key : newString);
          }
          ast.statements[i] = new Handlebars.AST.ContentNode(newString);
        }
        // If we need to recurse
        else if ( statement.program ) {
          statement.program = replaceLocaleStrings( statement.program, mapping, options );
        }
      });
      // Also cover the else blocks
      if (ast.inverse) {
        replaceLocaleStrings(ast.inverse, mapping, options);
      }
    }
    return ast;
  }

  return function(string, mapping, options) {
    options = options || {};
    var ast, environment;
    ast = Handlebars.parse(string);
    // avoid replacing locale if mapping is `false`
    if (mapping !== false) {
        ast = replaceLocaleStrings(ast, mapping, options);
    }
    environment = new Handlebars.Compiler().compile(ast, options);
    return new Handlebars.JavaScriptCompiler().compile(environment, options);
  };

});
;
/**
 * @license Handlebars hbs 0.4.0 - Alex Sexton, but Handlebars has it's own licensing junk
 *
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details on the plugin this was based off of
 */

/* Yes, deliciously evil. */
/*jslint evil: true, strict: false, plusplus: false, regexp: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
define: false, process: false, window: false */
csui.define('hbs',[
'module', 'require', 'csui/lib/handlebars', 'csui/lib/underscore', 'csui/lib/i18nprecompile'
], function (
 module, _require, Handlebars, _, precompile
) {

  var fs, getXhr,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        fetchText = function () {
            throw new Error('Environment unsupported.');
        },
        buildMap = [],
        filecode = "w+",
        templateExtension = "hbs",
        customNameExtension = "@hbs",
        devStyleDirectory = "/styles/",
        buildStyleDirectory = "/demo-build/styles/",
        helperDirectory = "template/helpers/",
        i18nDirectory = "template/i18n/",
        buildCSSFileName = "screen.build.css";

    Handlebars.registerHelper('$', function() {
        //placeholder for translation helper
    });

    if (typeof window !== "undefined" && window.navigator && window.document && !window.navigator.userAgent.match(/Node.js/)) {
        // Browser action
        getXhr = function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else {
                for (i = 0; i < 3; i++) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            if (!xhr) {
                throw new Error("getXhr(): XMLHttpRequest not available");
            }

            return xhr;
        };

        fetchText = function (url, callback) {
            var xhr = getXhr();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function (evt) {
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    callback(xhr.responseText);
                }
            };
            xhr.send(null);
        };

    } else if (typeof process !== "undefined" &&
               process.versions &&
               !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');
        fetchText = function ( path, callback ) {
            var body = fs.readFileSync(path, 'utf8') || "";
            // we need to remove BOM stuff from the file content
            body = body.replace(/^\uFEFF/, '');
            callback(body);
        };
    } else if (typeof java !== "undefined" && typeof java.io !== "undefined") {
        fetchText = function(path, callback) {
            var f = new java.io.File(path);
            var is = new java.io.FileReader(f);
            var reader = new java.io.BufferedReader(is);
            var line;
            var text = "";
            while ((line = reader.readLine()) !== null) {
                text += new String(line) + "\n";
            }
            reader.close();
            callback(text);
        };
    }

    var cache = {};
    var fetchOrGetCached = function ( path, callback ){
      if ( cache[path] ){
        callback(cache[path]);
      }
      else {
        fetchText(path, function(data){
          cache[path] = data;
          callback.call(this, data);
        });
      }
    };
    var styleList = [], styleMap = {};

      result = {

        get: function () {
            return Handlebars;
        },

        write: function (pluginName, name, write) {

            if ( (name + customNameExtension ) in buildMap) {
                var text = buildMap[name + customNameExtension];
                write.asModule(pluginName + "!" + name, text);
            }
        },

        version: '0.4.0',

        load: function (name, parentRequire, load, config) {
          
            var compiledName = name + customNameExtension,
                disableI18n = (config.hbs && config.hbs.disableI18n),
                partialDeps = [];

            function recursiveNodeSearch( statements, res ) {
              _(statements).forEach(function ( statement ) {
                if ( statement && statement.type && statement.type === 'partial' ) {
                    res.push(statement.partialName.name);
                }
                if ( statement && statement.program && statement.program.statements ) {
                  recursiveNodeSearch( statement.program.statements, res );
                }
                if ( statement && statement.program && statement.program.inverse && statement.program.inverse.statements ) {
                  recursiveNodeSearch( statement.program.inverse.statements, res );
                }
              });
              return res;
            }

            // TODO :: use the parser to do this!
            function findPartialDeps( nodes ) {
              var res   = [];
              if ( nodes && nodes.statements ) {
                res = recursiveNodeSearch( nodes.statements, [] );
              }
              return _(res).unique();
            }

            // See if the first item is a comment that's json
            function getMetaData( nodes ) {
              var statement, res, test;
              if ( nodes && nodes.statements ) {
                statement = nodes.statements[0];
                if ( statement && statement.type === "comment" ) {
                  try {
                    res = ( statement.comment ).replace(new RegExp('^[\\s]+|[\\s]+$', 'g'), '');
                    test = JSON.parse(res);
                    return res;
                  }
                  catch (e) {
                    return "{}";
                  }
                }
              }
              return "{}";
            }
            function composeParts ( parts ) {
              if ( !parts ) {
                return [];
              }
              var res = [parts[0]],
                  cur = parts[0],
                  i;

              for (i = 1; i < parts.length; ++i) {
                if ( parts.hasOwnProperty(i) ) {
                  cur += "." + parts[i];
                  res.push( cur );
                }
              }
              return res;
            }

            function recursiveVarSearch( statements, res, prefix, helpersres ) {
              prefix = prefix ? prefix+"." : "";

              var  newprefix = "", flag = false;

              // loop through each statement
              _(statements).forEach(function ( statement ) {
                var parts, part, sideways;

                // if it's a mustache block
                if ( statement && statement.type && statement.type === 'mustache' ) {

                  // If it has params, the first part is a helper or something
                  if ( !statement.params || ! statement.params.length ) {
                    parts = composeParts( statement.id.parts );
                    for( part in parts ) {
                      if ( parts[ part ] ) {
                        newprefix = parts[ part ] || newprefix;
                        res.push( prefix + parts[ part ] );
                      }
                    }
                    res.push(prefix + statement.id.string);
                  }

                  var paramsWithoutParts = ['this', '.', '..', './..', '../..', '../../..'];

                  // grab the params
                  if ( statement.params && typeof Handlebars.helpers[statement.id.string] === 'undefined') {
                    _(statement.params).forEach(function(param) {
                      if ( _(paramsWithoutParts).contains(param.original)
                         || param instanceof Handlebars.AST.StringNode
                        || param instanceof Handlebars.AST.IntegerNode
                        || param instanceof Handlebars.AST.BooleanNode
                        ) {
                        helpersres.push(statement.id.string);
                      }

                      parts = composeParts( param.parts );

                      for(var part in parts ) {
                        if ( parts[ part ] ) {
                          newprefix = parts[part] || newprefix;
                          helpersres.push(statement.id.string);
                          res.push( prefix + parts[ part ] );
                        }
                      }
                    });
                  }
                }

                // If it's a meta block
                if ( statement && statement.mustache  ) {
                  recursiveVarSearch( [statement.mustache], res, prefix + newprefix, helpersres );
                }

                // if it's a whole new program
                if ( statement && statement.program && statement.program.statements ) {
                  sideways = recursiveVarSearch([statement.mustache],[], "", helpersres)[0] || "";
                  if ( statement.program.inverse && statement.program.inverse.statements ) {
                    recursiveVarSearch( statement.program.inverse.statements, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? "."+sideways : sideways : ""), helpersres);
                  }
                  recursiveVarSearch( statement.program.statements, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? "."+sideways : sideways : ""), helpersres);
                }
              });
              return res;
            }

            // This finds the Helper dependencies since it's soooo similar
            function getExternalDeps( nodes ) {
              var res   = [];
              var helpersres = [];

              if ( nodes && nodes.statements ) {
                res = recursiveVarSearch( nodes.statements, [], undefined, helpersres );
              }

              var defaultHelpers = ["helperMissing", "blockHelperMissing", "each", "if", "unless", "with"];

              return {
                vars : _(res).chain().unique().map(function(e){
                  if ( e === "" ) {
                    return '.';
                  }
                  if ( e.length && e[e.length-1] === '.' ) {
                    return e.substr(0,e.length-1) + '[]';
                  }
                  return e;
                }).value(),
                helpers : _(helpersres).chain().unique().map(function(e){
                  if ( _(defaultHelpers).contains(e) ) {
                    return undefined;
                  }
                  return e;
                }).compact().value()
              };
            }

            function fetchAndRegister(langMap){
              fetchText(path, function (text) {
                  // for some reason it doesn't include hbs _first_ when i don't add it here...
                  var nodes = Handlebars.parse(text),
                      deps = findPartialDeps( nodes ),
                      meta = getMetaData( nodes ),
                      extDeps = getExternalDeps( nodes ),
                      vars = extDeps.vars,
                      helps = extDeps.helpers || [],
                      depStr = deps.join("', 'hbs!").replace(/_/g, '/'),
                      helpDepStr = config.hbs && config.hbs.disableHelpers ?
                      "" : (function (){
                        var i, paths = [],
                            pathGetter = config.hbs && config.hbs.helperPathCallback
                              ? config.hbs.helperPathCallback
                              : function (name){return (config.hbs && config.hbs.helperDirectory ? config.hbs.helperDirectory : helperDirectory) + name;};

                        for ( i = 0; i < helps.length; i++ ) {
                          paths[i] = "'" + pathGetter(helps[i], path) + "'"
                        }
                        return paths;
                      })().join(','),
                      debugOutputStart = "",
                      debugOutputEnd   = "",
                      debugProperties = "",
                      metaObj, head, linkElem;

                  if ( depStr ) {
                    depStr = ",'hbs!" + depStr + "'";
                  }
                  if ( helpDepStr ) {
                    helpDepStr = "," + helpDepStr;
                  }

                  if ( meta !== "{}" ) {
                    try {
                      metaObj = JSON.parse(meta);
                      if ( metaObj && metaObj.styles ) {
                        styleList = _.union(styleList, metaObj.styles);

                        // In dev mode in the browser
                        if ( require.isBrowser && ! config.isBuild ) {
                          head = document.head || document.getElementsByTagName('head')[0];
                          _(metaObj.styles).forEach(function (style) {
                            if ( !styleMap[style] ) {
                              linkElem = document.createElement('link');
                              linkElem.href = config.baseUrl + devStyleDirectory + style + '.css';
                              linkElem.media = 'all';
                              linkElem.rel = 'stylesheet';
                              linkElem.type = 'text/css';
                              head.appendChild(linkElem);
                              styleMap[style] = linkElem;
                            }
                          });
                        }
                        else if ( config.isBuild ) {
                          (function(){
                            var fs  = require.nodeRequire('fs'),
                                str = _(metaObj.styles).map(function (style) {
                                  if (!styleMap[style]) {
                                    styleMap[style] = true;
                                    return "@import url("+style+".css);\n";
                                  }
                                  return "";
                                }).join("\n");

                            // I write out my import statements to a file in order to help me build stuff.
                            // Then I use a tool to inline my import statements afterwards. (you can run r.js on it too)
                            fs.open(__dirname + buildStyleDirectory + buildCSSFileName, filecode, '0666', function( e, id ) {
                              fs.writeSync(id, str, null, encoding='utf8');
                              fs.close(id);
                            });
                            filecode = "a";
                          })();
                        }
                      }
                    }
                    catch(e){
                      typeof console !== 'undefined' && console.log('error injecting styles');
                    }
                  }

                  if ( ! config.isBuild && ! config.serverRender ) {
                    debugOutputStart = "<!-- START - " + name + " -->";
                    debugOutputEnd = "<!-- END - " + name + " -->";
                    debugProperties = "t.meta = " + meta + ";\n" +
                                      "t.helpers = " + JSON.stringify(helps) + ";\n" +
                                      "t.deps = " + JSON.stringify(deps) + ";\n" +
                                      "t.vars = " + JSON.stringify(vars) + ";\n";
                  }

                  var mapping = disableI18n? false : _.extend( langMap, config.localeMapping ),
                      configHbs = config.hbs || {},
                      options = _.extend(configHbs.compileOptions || {}, { originalKeyFallback: configHbs.originalKeyFallback }),
                      prec = precompile( text, mapping, options);

                  text = "/* START_TEMPLATE */\n" +
                         "define(['module','hbs','csui/lib/handlebars'"+depStr+helpDepStr+"], function( module, hbs, Handlebars ){ \n" +
                           "var t = Handlebars.template(" + prec + ");\n" +
                           "Handlebars.registerPartial('" + name.replace( /\//g , '_') + "', t);\n" +
                           debugProperties +
                           "return t;\n" +
                         "});\n" +
                         "/* END_TEMPLATE */\n";

                  //Hold on to the transformed text if a build.
                  if (config.isBuild) {
                      buildMap[compiledName] = text;
                  }

                  //IE with conditional comments on cannot handle the
                  //sourceURL trick, so skip it if enabled.
                  /*@if (@_jscript) @else @*/
                  if (!config.isBuild) {
                      text += "\r\n//# sourceURL=" + path;
                  }
                  /*@end@*/

                  for ( var i in deps ) {
                    if ( deps.hasOwnProperty(i) ) {
                      deps[ i ] = 'hbs!' + deps[ i ].replace(/_/g, '/');
                    }
                  }

                  if ( !config.isBuild ) {
                      _require( deps, function (){
                      load.fromText(text);

                      //Give result to load. Need to wait until the module
                      //is fully parse, which will happen after this
                      //execution.
                      parentRequire([name], function (value) {
                        load(value);
                      });
                    });
                  }
                  else {
                    load.fromText(name, text);

                    //Give result to load. Need to wait until the module
                    //is fully parse, which will happen after this
                    //execution.
                    parentRequire([name], function (value) {
                      load(value);
                    });
                  }

                  if ( config.removeCombined ) {
                    fs.unlinkSync(path);
                  }
              });
            }

            var path,
                omitExtension = config.hbs && config.hbs.templateExtension === false;
            if(omitExtension) {
              path = parentRequire.toUrl(name);
            } else {
              path = parentRequire.toUrl(name +'.'+ (config.hbs && config.hbs.templateExtension ? config.hbs.templateExtension : templateExtension));
            }

            if (disableI18n){
                fetchAndRegister(false);
            } else {
            	// Workaround until jam is able to pass config info or we move i18n to a separate module.
            	// This logs a warning and disables i18n if there's an error loading the language file
            	var langMapPath = (config.hbs && config.hbs.i18nDirectory ? config.hbs.i18nDirectory : i18nDirectory) + (config.locale || "en_us") + '.json';
            	try {
					fetchOrGetCached(parentRequire.toUrl(langMapPath), function (langMap) {
					  fetchAndRegister(JSON.parse(langMap));
					});
                } catch(er) {
                	// if there's no configuration at all, log a warning and disable i18n for this and subsequent templates
                	if(!config.hbs) {
                		console.warn('hbs: Error reading ' + langMapPath + ', disabling i18n. Ignore this if you\'re using jam, otherwise check your i18n configuration.\n');
						config.hbs = {disableI18n: true};
                		fetchAndRegister(false);
                	} else {
                		throw er;

                	}
                }
            }
                  }
      };

      return result;

});
/* END_hbs_PLUGIN */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/integration/folderbrowse/impl/full.page.workspace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<iframe id=\"xecm-full-page-frame\" width=\"100%\" height=\"100%\" src=\""
    + this.escapeExpression(((helper = (helper = helpers.fullPageWorkspaceUrl || (depth0 != null ? depth0.fullPageWorkspaceUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"fullPageWorkspaceUrl","hash":{}}) : helper)))
    + "\" />\r\n ";
}});
Handlebars.registerPartial('xecmpf_widgets_integration_folderbrowse_impl_full.page.workspace', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/integration/folderbrowse/full.page.workspace.view',['module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'hbs!xecmpf/widgets/integration/folderbrowse/impl/full.page.workspace',
  'css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse'
], function (module, _, $, Marionette, FullPageWorkspaceTemplate) {
  "use strict";
  var FullPageWorkpsaceView = Marionette.ItemView.extend({
    className: 'xecm-full-page-workspace',
    constructor: function FullPageWorkpsaceView(options) {
      options = options || {};
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },
    template: FullPageWorkspaceTemplate,
    templateHelpers: function () {
      return {
        fullPageWorkspaceUrl: this.options.fullPageWorkspaceUrl
      };
    }
  });
  return FullPageWorkpsaceView;
});

csui.define('xecmpf/widgets/integration/folderbrowse/search.results/search.results.view',['module', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/widgets/search.results/search.results.view',
  'i18n!xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',
  "css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse"
], function (module, _, $, SearchResultsView, Lang) {
  "use strict";

  var CustomSearchResultsView = SearchResultsView.extend({
    constructor: function CustomSearchResultsView(options) {
      options = options || {};
      options = _.extend(options, options.data);
      SearchResultsView.prototype.constructor.call(this, options);
      this.listenTo(this,"go:back",function(){
        history.back();
      })
    }
  });

  return CustomSearchResultsView;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"binf-modal-dialog binf-modal-lg\">\r\n  <div class=\"binf-modal-content\">\r\n    <div class=\"xecm-modal-header\">\r\n      <div title=\""
    + this.escapeExpression(((helper = (helper = helpers.closeToolTip || (depth0 != null ? depth0.closeToolTip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"closeToolTip","hash":{}}) : helper)))
    + "\"\r\n          class=\"cs-close icon-tileCollapse icon-pagewidget-collapse csui-acc-focusable-active\"></div>\r\n    </div>\r\n    <div class=\"binf-modal-body\"></div>\r\n  </div>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_widgets_integration_folderbrowse_modaldialog_impl_modal.dialog', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog',[],function(){});
csui.define('xecmpf/widgets/integration/folderbrowse/modaldialog/modal.dialog.view',['csui/controls/dialog/dialog.view',
  'hbs!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog',
  'i18n!xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',
  'css!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog'
], function (DialogView, Template, Lang) {
  var ModalDialogView = DialogView.extend({
    template: Template,
    templateHelpers: function () {
      return {
        closeToolTip: Lang.CloseToolTip
      };
    }
  });
  return ModalDialogView;
});
csui.define('xecmpf/utils/commands/nls/localized.strings',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/utils/commands/nls/root/localized.strings',{

  DetachPageLeavingWarning: "If you leave the page now, pending items will not be detached.",
  DetachBusAtts: 'Detaching {0} business objects',
  DetachingOneBusAtt: 'Detaching business object',

  DetachBusAttsNoneMessage: "No business objects detached.",
  DetachOneBusAttSuccessMessage: "1 business object succeeded to detach.",
  DetachSomeBusAttsSuccessMessage: "{0} business objects succeeded to detach.",
  DetachManyBusAttsSuccessMessage: "{0} business objects succeeded to detach.",
  DetachOneBusAttFailMessage: "1 business object failed to detach.",
  DetachSomeBusAttsFailMessage: "{0} business objects failed to detach.",
  DetachManyBusAttsFailMessage2: "{2} business objects failed to detach.", // {2} !!
  DetachSomeBusAttsFailMessage2: "{2} business objects failed to detach.", // {2} !!
  DetachingSomeBusAtts: 'Detaching {0} business objets',

  DetachBusAttsCommandConfirmDialogTitle: "Detach",
  DetachBusAttsCommandConfirmDialogSingleMessage: "Do you want to detach {0}?",
  DetachBusAttsCommandConfirmDialogMultipleMessage: "Do you want to detach {0} items?",
  CommandDoneVerbDetached: 'detached',
  CommandNameDetach: 'Detach Business Attachment',

  AttachPageLeavingWarning: "If you leave the page now, pending items will not be detached.",
  AttachBusAtts: 'Attaching {0} business objects',
  AttachingOneBusAtt: 'Attaching business object',

  AttachBusAttsNoneMessage: "No business objects attached.",
  AttachOneBusAttSuccessMessage: "1 business object succeeded to attach.",
  AttachSomeBusAttsSuccessMessage: "{0} business objects succeeded to attach.",
  AttachManyBusAttsSuccessMessage: "{0} business objects succeeded to attach.",
  AttachOneBusAttFailMessage: "1 business object failed to attach.",
  AttachSomeBusAttsFailMessage: "{0} business objects failed to attach.",
  AttachManyBusAttsFailMessage: "{0} business objects failed to attach.",
  AttachManyBusAttsFailMessage2: "{2} business objects failed to attach.", // {2} !!
  AttachSomeBusAttsFailMessage2: "{2} business objects failed to attach.", // {2} !!
  AttachingSomeBusAtts: 'attaching {0} business objets',

  AttachBusAttsCommandConfirmDialogTitle: "Attach",
  AttachBusAttsCommandConfirmDialogSingleMessage: "Do you want to attach {0}?",
  AttachBusAttsCommandConfirmDialogMultipleMessage: "Do you want to attach {0} items?",
  AttachBusAttsCommandConfirmDialogHtml: "<span class='msgIcon WarningIcon'>" +
    "<%- message %>" +
    "</span>",
  CommandDoneVerbAttached: 'attached',
  CommandNameAttach: 'Attach Business Attachment',

  CommandNameOpenSapObject: 'Open Sap Object',

  CommandNameGoToWorkspace: 'Go To Workspace',

  GoToWorkpsaceHistory: "Go To Workspace History",
  OpenFullPageWorkpsace: "Open Full Page Wokspace",
  SearchWorkspace: "Search From Here",
  SearchBackTooltip: "Go Back to '{0}'",
  CollapsePageOverlay: "Close",

  /* Start BO Attachment */
  BOAttachmentCreate: {
    name: 'Add business attachment',
    verb: 'attach',
    doneVerb: 'attached',
    addButtonLabel: 'Attach',
    pageLeavingWarning: 'If you leave the page now, pending items will not be attached.',
    successMessages: {
      formatForNone: 'No business attachments attached.',
      formatForOne: '1 business attachment succeeded to attach.',
      formatForMultiple: '{0} business attachments succeeded to attach.'
    },
    errorMessages: {
      //formatForNone: 'No business attachments attached.',
      formatForOne: '1 business attachment failed to attach.',
      formatForMultiple: '{0} business attachments failed to attach.'
    },
    progressBarMessages: {
      oneFileTitle: 'Attaching business attachment',
      //oneFileSuccess: '1 business attachment succeeded to attach.',
      //multiFileSuccess: '{0} business attachments succeeded to attach.',
      //oneFilePending: 'Attaching business attachment',
      multiFilePending: 'Attaching {0} business attachments',
      //oneFileFailure: '1 business attachment failed to attach.',
      multiFileFailure: '{2} business attachments failed to attach.', // {2} !!
      //someFileSuccess: '{0} business attachments succeeded to attach.',
      //someFilePending: 'Attaching {0} business attachments',
      //someFileFailure: '{2} business attachments failed to attach.' // {2} !!
    }
  },
  /* End BO Attachment */

  backButtonToolTip: 'Go back',

  // BO Attachments Snapshot Command
  CommandSnapshot: 'Snapshot',
  snapshotCreated: 'Snapshot created',
  snapshotCreatedWithName: "Snapshot '{0}' created",
  snapshotFailed: 'Snapshot creation failed',
  CommandDoneVerbCreated: 'created',

  //EAC Global Messages
  Refresh: 'Events refreshed.',
  RefreshError: 'Error while refreshing.',
  AuthenticationError: 'Authentication failed'
});

csui.define('xecmpf/utils/commands/folderbrowse/go.to.workspace.history',['module',
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/models/command',
  'csui/lib/backbone',
  'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, $, _, CommandModel, Backbone, lang) {
  var localHistory = [location.href]
  var listening;
  var GoToWorkpsaceHistory = CommandModel.extend({
    defaults: {
      signature: 'WorkspaceHistory',
      name: lang.GoToWorkpsaceHistory
    },
    enabled: function (status, options) {
      var config = _.extend({
        enabled: false
      }, module.config());
      if (!listening) {
        listening = true;
        window.addEventListener('popstate', function () {
          if (localHistory.length > 1 && localHistory[localHistory.length - 2] === location.href) {
            localHistory.pop();
          }
        });
        Backbone.history.on('navigate', function () {
          localHistory.push(location.href);
        });
      }
      return config.enabled && localHistory.length > 1;
    },
    execute: function (status, options) {
      history.back();
      return $.Deferred().resolve().promise();
    }

  });
  return GoToWorkpsaceHistory;
});




csui.define('xecmpf/utils/commands/folderbrowse/search.container',['module',
  'require',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/marionette',
  'csui/models/command',
  'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, require, _, $, Marionette, CommandModel, lang) {
  var SearchWorkspace = CommandModel.extend({

    defaults: {
      signature: 'SearchFromHere',
      name: lang.SearchWorkspace
    },
    enabled: function (status, options) {
      var config = _.extend({
        enabled: false
      }, module.config());
      return config.enabled;
    },

    execute: function (status, options) {
      var config = _.extend({
        pageWidget: false
      }, module.config());

      var self         = this;
      var deferred = $.Deferred();
      csui.require(['xecmpf/widgets/integration/folderbrowse/search.box.view',
        'xecmpf/controls/search.textbox/search.textbox.view',
        'csui/widgets/search.results/search.results.view',
        'csui/utils/contexts/factories/node',
        'csui/utils/contexts/factories/next.node',
        'csui/utils/contexts/factories/search.query.factory',
        this.get('commands')
      ], function (SearchBoxView, HeaderSearchBoxView, SearchResultsView, NodeModelFactory,
          NextNodeModelFactory, SearchQueryModelFactory, commands) {
        var searchIconHolder = status.originatingView.$el.find('.csui-search-button');
        if (!searchIconHolder.find('div.csui-searchbox-holder').length) {
          searchIconHolder.append("<div class='csui-searchbox-holder'></div>");
        }
        //var self         = this,
        var  searchRegion = new Marionette.Region({
              el: options.el ? options.el : searchIconHolder.find('div.csui-searchbox-holder')
            }),
            context      = status.originatingView && status.originatingView.context ? status.originatingView.context :
                           options && options.context,
            node         = !!context ? context.getModel(NodeModelFactory) : null,
            nodeId       = !!node ? node.get("id") : 0,
            wkspNodeId   = (status.originatingView && status.originatingView.options && status.originatingView.options.workspaceContext && status.originatingView.options.workspaceContext.wkspid && status.originatingView.options.workspaceContext.wkspid.get("id")) ? status.originatingView.options.workspaceContext.wkspid.get("id") : 0;
        if (!config.pageWidget) { // No need to delete the the factory in case of page widget as
          // it is cleared on perspective change
          delete context._factories["searchQuery"];
        }
        var searchInCommand = false;
        var searchView = wkspNodeId === 0 ? SearchBoxView : HeaderSearchBoxView;
        searchInCommand = wkspNodeId === 0 ? false : true;
        self.searchBoxView = new searchView({
            context: context,
            originatingView: status.originatingView,
            data: {
              nodeId: wkspNodeId === 0 ? nodeId : wkspNodeId
            }
        });

        self.originatingViewElement = status.originatingView.$el;
        self.listenTo(self.searchBoxView, "hide:searchbar", function () {
          self.searchBoxView.destroy();
          self.originatingViewElement.find("a.csui-toolitem").show();
          self.originatingViewElement.find("a.csui-toolitem").focus();
        });
        self.listenTo(self.searchBoxView, "show", function () {
          setTimeout(function () {
              var inputBoxClass = !!searchInCommand ? '.xecmpf-input' : '.csui-input';
              self.originatingViewElement.find(inputBoxClass).focus();  
          }, 25);
        });
        
        status.originatingView.$el.find('.csui-search-button > a.csui-toolitem').hide();
        searchRegion.show(self.searchBoxView);
        if (!config.pageWidget || searchInCommand) {
          // replace the originatingView with sliding left/right animation
          if (status.originatingView) {
            var _searchQuery = context.getModel(SearchQueryModelFactory);
            var _viewName, _triggerViewName, _eventName;
            if (searchInCommand) {
              _viewName = self.searchBoxView,
              _triggerViewName = self.searchBoxView,
              _eventName = 'search:results'
            } else {
              _viewName = status.originatingView,
              _triggerViewName = _searchQuery,
              _eventName = 'change'
           }
           
            _viewName.listenToOnce(_triggerViewName, _eventName, function () {
              delete context._factories["searchResults"];
              var searchResultsView = new SearchResultsView({
                container: status.container,
                originatingView: status.originatingView,
                context: context,
                commands: commands,
                enableBackButton: true,
                backButtonToolTip: _.str.sformat(lang.SearchBackTooltip,
                    status.container.get("name"))
              });

              var _showOriginatingView, $csSearchResults;
              var originatingViewParent = self.originatingViewElement.parent();
              originatingViewParent.find('.cs-search-results-wrapper').remove();
              originatingViewParent.append("<div class='cs-search-results-wrapper'></div>");

              self.$csSearchResults = $(
                  originatingViewParent.find('.cs-search-results-wrapper')[0]);
              self.$csSearchResults.hide();
              searchResultsView.render();
              if (searchInCommand) {
                searchResultsView.collection.fetch();
              } else {
                context.fetch();
              }
              Marionette.triggerMethodOn(searchResultsView, 'before:show');
              self.$csSearchResults.append(searchResultsView.el);
              if (searchInCommand) {
                self.originatingViewElement.hide();
              } else {
                self.originatingViewElement.hide('blind', {
                  direction: 'left',
                  complete: function () {
                    self.$csSearchResults.show('blind',
                        {
                          direction: 'right',
                          complete: function () {
                            Marionette.triggerMethodOn(searchResultsView, 'show');
                          }
                        },
                        100);
                  }
                }, 100);
              }
              
              _showOriginatingView = function () {

                self.$csSearchResults.hide('blind', {
                  direction: 'right',
                  complete: function () {
                    self.originatingViewElement.show('blind',
                        {
                          direction: 'left',
                          complete: function () {
                            delete context._factories["searchResults"];
                            status.originatingView.triggerMethod('dom:refresh');
                          }
                        },
                        100);
                    searchResultsView.destroy();
                    self.$csSearchResults.remove();
                  }
                }, 100);
              };
              self._nextNode = context.getModel(NextNodeModelFactory);
              self.listenToOnce(self._nextNode, 'change:id', _.bind(_showOriginatingView, self));
              self.listenToOnce(searchResultsView, 'go:back', _.bind(_showOriginatingView, self));

            });
          }
        }
        deferred.resolve();
      }, function (error) {
        deferred.reject(error);
      });

      return deferred.promise();
    }
  });

  return SearchWorkspace;
});
csui.define('xecmpf/utils/commands/folderbrowse/open.full.page.workspace',['module',
  'require',
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/models/command',
  'csui/utils/contexts/factories/connector',
  'csui/utils/url',
  'csui/dialogs/modal.alert/modal.alert',
  'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, require, $, _, CommandModel, ConnectorFactory, Url, ModalAlert, lang) {
  var OpenFullPageWorkpsace = CommandModel.extend({
    defaults: {
      signature: 'WorkspacePage',
      name: lang.OpenFullPageWorkpsace,
      scope: 'single'
    },

    enabled: function (status, options) {
      var config = _.extend({
        enabled: false
      }, module.config());
      return config.enabled && !!status.container;
    },

    execute: function (status, options) {
      var that                 = this,
          config               = _.extend({
            fullPageOverlay: false,
          }, module.config()),
          deferred             = $.Deferred(),
          context              = status.originatingView ? status.originatingView.context :
                                 options && options.context,
          urlPrefix            = 'xecm',
          connector            = context.getObject(ConnectorFactory),
          cgiUrl               = connector && connector.connection && connector.connection.url ?
                                 connector.connection.url.replace('/api/v1', '') : '',
          currentWindowRef     = window,
          applyTheme           = !!status && !!status.data && !!status.data.applyTheme,
          themePath            = applyTheme ? $(currentWindowRef.document).find(
              "head > link[data-csui-theme-overrides]").attr('href') : undefined,
          fullPageWorkspaceUrl = Url.combine(cgiUrl, urlPrefix, 'nodes',
              status.container.get('id')),
          xhr                  = new XMLHttpRequest(),
          targetOrigin         = new Url(cgiUrl).getAbsolute();
      if (config.fullPageOverlay) {
        csui.require(['xecmpf/widgets/integration/folderbrowse/modaldialog/modal.dialog.view',
              'xecmpf/widgets/integration/folderbrowse/full.page.workspace.view'
            ],
            function (ModalDialogView, FullPageWorkspaceView) {
              that.authenticate(xhr, cgiUrl, connector);
              xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                  fullPageWorkspaceUrl = Url.appendQuery(fullPageWorkspaceUrl, "pageOverlay=true");
                  var fullPageWorkspaceView = new FullPageWorkspaceView({
                        fullPageWorkspaceUrl: fullPageWorkspaceUrl
                      }),
                      dialog                = new ModalDialogView({
                        title: status.container.get("name"),
                        className: 'xecm-modal-dialog',
                        iconRight: "icon-tileCollapse",
                        view: fullPageWorkspaceView
                      });
                  dialog.show();
                  currentWindowRef.addEventListener("message", function (e) {
                    if (e.origin &&
                        (new RegExp(e.origin, "i").test(new Url(cgiUrl).getOrigin()))) {
                      if (e.data) {
                        if (e.data.status === 'closeDialog') {
                          dialog.$el.find(".cs-close").click();
                        } else if (e.data.status === 'showDialogHeader') {
                          dialog.$el.find(".xecm-modal-header").show();
                        } else if (e.data.status === 'hideDialogHeader') {
                          dialog.$el.find(".xecm-modal-header").hide();
                        }
                      }
                    }
                  });

                  if (applyTheme) {
                    var setTheme = function (e) {
                      if (e.origin &&
                          (new RegExp(e.origin, "i").test(new Url(cgiUrl).getOrigin()))) {
                        if (e.data) {
                          if (e.data.status === "ok") {
                            e.source.postMessage({
                              "themePath": themePath
                            }, targetOrigin);
                            currentWindowRef.removeEventListener("message", setTheme, false);
                          }
                        }
                      }
                    }
                    currentWindowRef.addEventListener("message", setTheme);
                  }
                }
              }
              deferred.resolve();
            },
            function (error) {
              deferred.reject(error);
            });
      } else {
        var targetWindowRef = currentWindowRef.open('');
        this.authenticate(xhr, cgiUrl, connector);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            targetWindowRef.location.href = fullPageWorkspaceUrl;
            if (applyTheme) {
              currentWindowRef.addEventListener("message", function (e) {
                if (e.origin && (new RegExp(e.origin, "i").test(new Url(cgiUrl).getOrigin()))) {
                  if (e.data) {
                    if (e.data.status === "ok") {
                      targetWindowRef.postMessage({
                        "themePath": themePath
                      }, targetOrigin);
                    }
                  }
                }

              });
            }
          }
          deferred.resolve();
        }
      }
      return deferred.promise();
    },
    authenticate: function (xhr, cgiUrl, connector) {
      if (connector.connection.session && connector.connection.session.ticket) {
        this.authenticateworkspace(xhr, cgiUrl, connector);
      } else if (!!connector.connection.credentials) {
        var that    = this,
            request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            try {
              if (request.status === 200) {
                var contentType = request.getResponseHeader('content-type');
                if (/^application\/json/i.test(contentType)) {
                  var response = JSON.parse(request.responseText);
                  connector.connection.session = response;
                  that.authenticateworkspace(xhr, cgiUrl, connector);
                } else {
                  throw new Error('Unsupported content type: ' + contentType);
                }
              } else {
                throw new Error(request.status + ' ' + request.statusText);
              }
            } catch (error) {
              console.error(error);
            }
          }
        };
        request.open('POST', connector.connection.url + '/auth', true);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('username=' + encodeURIComponent(connector.connection.credentials.username) +
                     '&' + 'password=' +
                     encodeURIComponent(connector.connection.credentials.password));
      } else {
        ModalAlert.showError(lang.AuthenticationError);
      }
    },
    authenticateworkspace: function (xhr, cgiUrl, connector) {
      xhr.open("GET", cgiUrl + "/xecmauth", true);
      xhr.setRequestHeader("OTCSTicket", connector.connection.session.ticket);
      xhr.withCredentials = true;
      xhr.send(null);
    }
  });

  return OpenFullPageWorkpsace;
});
csui.define('xecmpf/utils/commands/workspaces/workspace.delete',['module', 'require', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/utils/commandhelper', 'conws/utils/commands/delete',
  'csui/integration/folderbrowser/commands/go.to.node.history', 'csui/utils/commands/confirmable',
  'csui/controls/globalmessage/globalmessage'
], function (module, require, _, $,
  CommandHelper, DeleteCommand, GoToNodeHistoryCommand, ConfirmableCommand,
  GlobalMessage) {
  'use strict';

  var config = module.config();

  _.defaults(config, {
    extSystemViewModes: ['folderBrowse', 'fullPage'],
    extSystemEl: '#widgetWMainWindow'
  });


  var goToNodeHistoryCommand = new GoToNodeHistoryCommand();
  var origExecute = DeleteCommand.prototype._executeDelete,
    WkspDeleteCommand = DeleteCommand.extend({

      _executeDelete: function (status, options) {

        options || (options = {});

        var viewMode = this.get('viewMode') || config.viewMode,
          openFullPageWorkspaceEnabled = this.get('openFullPageWorkspaceEnabled'),
          goToNodeHistoryEnabled = this.get('goToNodeHistoryEnabled'),
          fullPageOverlayEnabled = this.get('fullPageOverlayEnabled');

        _.extend(status, {
          viewMode: viewMode && (viewMode.mode ? viewMode.mode : viewMode),
          wkspId: this.get('id') || config.id
        });

        var node = CommandHelper.getJustOneNode(status);

        options.originatingView = status.originatingView;

        // return the original CSUI delete execute call if
        // not an external system
        // OR if it is external system but deleting multiple nodes
        // OR if it is external system and deleting single node but not deleting the top level BWS
        if (config.extSystemViewModes.indexOf(status.viewMode) === -1 ||
          !node ||
          node.get('id') !== status.wkspId) {
          return origExecute.apply(this, arguments);
        }

        // bus. wksp. parameters
        _.extend(status, {
          busObjectId: this.get('busObjectId') || config['busObjectId'],
          busObjectType: this.get('busObjectType') || config['busObjectType'],
          extSystemId: this.get('extSystemId') || config['extSystemId']
        });

        var deferred = $.Deferred(),
          commandData = status.data || {},
          context = status.context || options.context,
          showProgressDialog = commandData.showProgressDialog != null ?
          commandData.showProgressDialog : true;

        ConfirmableCommand.execute.call(this, status, options)
          .done(function (results) {
            showProgressDialog && GlobalMessage.hideFileUploadProgress();
            csui.require(['xecmpf/widgets/workspaces/workspaces.widget'], function (WorkspacesWidget) {

              // SAPRM-10902: if workspace is deleted then clear as well the history
              goToNodeHistoryCommand.clearHistory(context);

              var data = {
                  deletecallback: true,
                  workspaceNodeId: 0, // no CS Workspace is available for the BO
                  busObjectId: status.busObjectId,
                  busObjectType: status.busObjectType,
                  extSystemId: status.extSystemId,
                  folderBrowserWidget: {
                    commands: {
                      'open.full.page.workspace': {
                        enabled: openFullPageWorkspaceEnabled,
                        fullPageOverlay: fullPageOverlayEnabled
                      },
                      'go.to.node.history': {
                        enabled: goToNodeHistoryEnabled
                      }
                    }
                  },
                  viewMode: {
                    mode: status.viewMode
                  }
                },
                workspacesWidget = new WorkspacesWidget({
                  context: context,
                  data: data
                });

              if (status.viewMode === 'fullPage') {
                window.top.postMessage(JSON.stringify(data), '*');
              } else {
                workspacesWidget.show({
                  placeholder: config.extSystemEl
                });
              }
            });
            deferred.resolve(results);
          })
          .fail(function (args) {
            deferred.reject(args);
          });
        return deferred.promise();
      }
    });

  DeleteCommand.prototype = WkspDeleteCommand.prototype;

  return WkspDeleteCommand;
});
csui.define('xecmpf/utils/commands/boattachments/boattachments.create',['module', 'require', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/utils/url',
  'csui/utils/commandhelper', 'csui/utils/command.error', 'csui/utils/commands/multiple.items',
  'csui/models/command', 'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, require, _, $, Url,
  CommandHelper, CommandError, MultipleItemsCommand,
  CommandModel, lang) {
  'use strict';

  var config = _.extend({
    nodesSelectionType: 'savedQuery' //browse
  }, module.config());

  var CmdModelWithMultipleItemsMixin = CommandModel.extend({});
  _.extend(CmdModelWithMultipleItemsMixin.prototype, MultipleItemsCommand);

  var GlobalMessage, BOAttachment;

  var BOAttachmentsCreate = CmdModelWithMultipleItemsMixin.extend({
    defaults: {
      signature: 'BOAttachmentsCreate',
      command_key: ['BOAttachmentsCreate'],
      name: lang.BOAttachmentCreate.name,
      verb: lang.BOAttachmentCreate.verb,
      doneVerb: lang.BOAttachmentCreate.doneVerb,
      pageLeavingWarning: lang.BOAttachmentCreate.pageLeavingWarning,
      scope: 'multiple',
      successMessages: {
        formatForNone: lang.BOAttachmentCreate.successMessages.formatForNone,
        formatForOne: lang.BOAttachmentCreate.successMessages.formatForOne,
        formatForTwo: lang.BOAttachmentCreate.successMessages.formatForMultiple,
        formatForFive: lang.BOAttachmentCreate.successMessages.formatForMultiple
      },
      errorMessages: {
        formatForNone: lang.BOAttachmentCreate.successMessages.formatForNone,
        formatForOne: lang.BOAttachmentCreate.errorMessages.formatForOne,
        formatForTwo: lang.BOAttachmentCreate.errorMessages.formatForMultiple,
        formatForFive: lang.BOAttachmentCreate.errorMessages.formatForMultiple
      }
    },

    enabled: function (status) {
      // to check the table header action in the search results table view
      if (status.data && status.data.enabledAttach) {
        var nodes = CommandHelper.getAtLeastOneNode(status);
        return !!nodes.length;
      }
      // to check if user can add BO attachment
      return !!status.collection &&
        !!status.collection.businessObjectActions &&
        !!status.collection.businessObjectActions.data &&
        _.has(status.collection.businessObjectActions.data, this.defaults.signature);
    },

    execute: function (status, options) {
      var deferred = $.Deferred();
      // avoid messages from handleExecutionResults
      status.suppressFailMessage = true;
      status.suppressSuccessMessage = true;
      status.context = status.context || options && options.context;

      options = _.extend(options, status.data, {
        collection: status.collection
      });

      // SelectedNodes would be available from "Saved Query Node Picker Results Table".
      var selectedNodes = CommandHelper.getAtLeastOneNode(status);
      if (selectedNodes.length && !!status.originatingView) {
        // originating view would be Search Results View
        // to set the _result in Saved Query Node Picker
        status.originatingView.triggerMethod('set:picker:result', {
          nodes: selectedNodes.models
        });
        // resolve the Search Results Table command execute
        deferred.resolve();
        // to close the Saved Query Node Picker
        status.originatingView.triggerMethod('close');
      }
      // if selectedNodes are not available, open node picker to select nodes
      else {
        status.nodesSelectionType = status.nodesSelectionType ||
          (options && options.nodesSelectionType) ||
          config.nodesSelectionType;

        csui.require(['csui/controls/globalmessage/globalmessage',
          'xecmpf/widgets/boattachments/impl/boattachment.model'
        ], function () {
          GlobalMessage = arguments[0];
          BOAttachment = arguments[1];
          this._selectNodes(status, options)
            .then(function (results) {
              this._showProgressbarAndPerformActions(results.nodes, status, options)
                .then(deferred.resolve, deferred.reject);
            }.bind(this), function (err) {
              if (err && !err.cancelled) {
                GlobalMessage.showMessage('error', err);
              }
              deferred.reject(); // cancel action without error
            });
        }.bind(this), deferred.reject);
      }
      return deferred;
    },

    _selectNodes: function (status, options) {
      var deferred = $.Deferred(),
        that = this;
      csui.require(['csui/dialogs/node.picker/node.picker',
        'xecmpf/controls/savedquery.node.picker/savedquery.node.picker.view',
        'csui/controls/toolbar/toolitems.factory'
      ], function (NodePickerDialog, SavedQueryNodePickerView, ToolItemsFactory) {

        var nodePicker = status.nodesSelectionType === 'savedQuery' ?

          new SavedQueryNodePickerView(_.extend({
            title: lang.BOAttachmentCreate.name,
            enableBackButton: true,
            backButtonToolTip: lang.backButtonToolTip,
            toolbarItems: {
              otherToolbar: new ToolItemsFactory({
                main: [{
                  signature: that.get('signature'),
                  name: lang.BOAttachmentCreate.addButtonLabel,
                  commandData: {
                    enabledAttach: true
                  }
                }]
              }, {
                maxItemsShown: 1,
                dropDownText: lang.ToolbarItemMore,
                dropDownIcon: 'icon icon-toolbar-more',
                addGroupSeparators: false
              }),
              // as discussed with PM, inline actions not required
              inlineToolbar: false
              /*new ToolItemsFactory({
                                             other: [
                                               {
                                                 signature: that.get('signature'),
                                                 name: that.get('name'),
                                                 icon: that.get('icon')
                                               }
                                             ]
                                           }, {
                                             maxItemsShown: 1,
                                             dropDownText: lang.ToolbarItemMore,
                                             dropDownIcon: 'icon icon-toolbar-more',
                                             addGroupSeparators: false
                                           })*/
            }
          }, _.omit(status, 'collection', 'toolbarItems'))) :

          new NodePickerDialog(_.extend({
            selectMultiple: true,
            selectableTypes: [],
            unselectableTypes: [],
            showAllTypes: true,
            dialogTitle: lang.BOAttachmentCreate.name,
            selectButtonLabel: lang.selectButtonLabel
          }));

        nodePicker
          .show()
          .then(deferred.resolve, deferred.reject);

      }, deferred.reject);
      return deferred;
    },

    _showProgressbarAndPerformActions: function (selectedNodes, status, options) {
      var deferred = $.Deferred();
      csui.require(['csui/models/fileuploads'], function (UploadFileCollection) {

        var models = _.map(selectedNodes, function (node) {
            return {
              name: node.get('name'),
              state: 'pending',
              count: 0,
              total: 1,
              node: node
            };
          }),
          uploadCollection = new UploadFileCollection(models),
          newStatus = _.defaults({
            nodes: uploadCollection,
            suppressMultipleFailMessage: true
          }, status);

        uploadCollection.each(function (model) {
          model.node = model.get('node');
          model.unset('node', {
            silent: true
          });
        });

        GlobalMessage.showFileUploadProgress(uploadCollection, {
          oneFileTitle: lang.BOAttachmentCreate.progressBarMessages.oneFileTitle,
          oneFileSuccess: lang.BOAttachmentCreate.successMessages.formatForOne,
          multiFileSuccess: lang.BOAttachmentCreate.successMessages.formatForMultiple,
          oneFilePending: lang.BOAttachmentCreate.progressBarMessages.oneFileTitle,
          multiFilePending: lang.BOAttachmentCreate.progressBarMessages.multiFilePending,
          oneFileFailure: lang.BOAttachmentCreate.errorMessages.formatForOne,
          multiFileFailure: lang.BOAttachmentCreate.progressBarMessages.multiFileFailure,
          someFileSuccess: lang.BOAttachmentCreate.successMessages.formatForMultiple,
          someFilePending: lang.BOAttachmentCreate.progressBarMessages.multiFilePending,
          someFileFailure: lang.BOAttachmentCreate.progressBarMessages.multiFileFailure,
          enableCancel: false
        });

        this._performActions(newStatus, options)
          .then(function () {
            GlobalMessage.hideFileUploadProgress();
            deferred.resolve.apply(deferred, arguments);
          }.bind(this), deferred.reject);

      }.bind(this), deferred.reject);
      return deferred;
    },

    _performAction: function (model, options) {
      var node = model.node,
        connector = node.connector;

      return $.ajax(connector.extendAjaxOptions({
        url: Url.combine(connector.connection.url.replace('/v1', '/v2'), 'businessobjects',
          options.extId, options.boType, options.boid, 'businessattachments', node.get('id')),
        type: 'POST',
        data: {
          expand: 'properties{original_id,ancestors,parent_id,reserved_user_id,createdby,modifiedby}'
        },
        success: function (response, status, xhr) {
          var boAttachment = new BOAttachment(response.results[0], {
            connector: connector,
            parse: true
          });
          boAttachment.isLocallyCreated = true;
          options.collection.add(boAttachment, {
            at: 0
          });
          model.deferred.resolve(model);
        },
        error: function (xhr, status, err) {
          var cmdError = xhr ? new CommandError(xhr, node) : xhr;
          model.deferred.reject(model, cmdError);
        },
        complete: function (xhr, status) {
          model.set('count', 1);
        }
      }));
    }
  });

  return BOAttachmentsCreate;
});
csui.define('xecmpf/widgets/eac/impl/nls/lang',{
    // Always load the root bundle for the default locale (en-us)
    "root": true,
    // Do not load English locale bundle provided by the root bundle
    "en-us": false,
    "en": false
});

// Defines localizable strings in the default language (English)

csui.define('xecmpf/widgets/eac/impl/nls/root/lang',{
    //New Localization Strings
    dialogTitle: "Event Action Center",
    selectAllLabel: "Select All",
    applyButtonLabel: "Apply",
    emptyListText: "No Events found.",
    ToolbarItemBack: "Back",
    ToolbarItemRefresh: "Refresh",
    finishButtonLabel: "Finish",
    addRuleHeaderLabel: "Add Rule",
    ToolbarItemFilter: "Filter",
    eventPlanNameLabel: "Change in employee location",
    addActionPlan: "Add action plan",
    actionPlan: "Action plan",
    columnEventName: "Event Name",
    columnSystemName: "System Name",
    columnActionPlan: "Action Plan",
    sourceLabel: "Source",
    editButtonLabel: "Edit",
    rulesLabel: "Rules",
    editAllButtonLabel: "Edit all",
    runAs: "Run as",
    processMode: "Process mode",
    noRulesDefined: "No Rules Defined",
    noActionDefined: "No Action Defined",
    noRecordsFound: "No Records found",
    actionsRequired: "Actions are required",
    resultfromPrevAct: 'Result from previous Action',
    listViewPageEventLabel: "Event",
    editActionPlan: "Edit Action Plan",
    addNew: "Add new Action plan",
    action: "Action Plan",
    addActionSummaryPageActionPlanLabel: "Action Plan",
    addActionSummaryPageBusinessApplication: "Business application",
    addActionSummaryPageEvent: "Event",
    backButtonLabel: "Back",
    nextButtonLabel: "Next",
    listViewPageAddActionPlan: "+ Add Action plan",
    listViewPageViewActionPlan: " Action plan",
    addActionSummaryPageRulesLabel: "Rules",
    actionPlanLabel: "Action Label",
    editRuleHeaderLabel: "Edit Rules",
    addActionPlanLabel: "Add Action Plan",
    editActionPlanLabel: "Edit Action Plan",
    saveActionPlanLabel: "Save Action Plan",
    updateActionPlanLabel: "Update Action Plan",
    addRuleDialogTitle: "Add Rule ",
    bussapplicatoin: "Business application",
    ruleLabel: "Rule",
    conditionLabel:"Condition",
    warningMsgondeletionOfLast1Rule: "Atleast 1 empty rule is mandatory",
    warningMsgondeletionOfLast1Action: "Atleast 1 Action is mandatory",
    confirmDeleteMsg: "Are you sure you want to delete the Action?",
    conjunctionAndLabel: "And",
    conjunctionOrLabel: "Or",
    operatorEqualtoLabel: "Equal to",
    operatorNotequaltoLabel: "Not equal to",
    synchronouslyProcessLabel: "Synchronously",
    csObjLabel: "Content Server object",
    evtPropLabel: "Event property",
    prevActLabel: "Result from previous action",
    actionLabel: "Action"
});


csui.define('xecmpf/models/eac/eac.eventlist.columns.definitions',['i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (lang) {

  var EACEventListColumnsDefinition = {
    "event_name": {
      "hidden": false,
      "key": "event_name",
      "name": lang.documentTypeLabel,
      "type": -1,
      "type_name": "String",
      "sort": true,
    },

    "namespace": {
      "key": "namespace",
      "name": lang.documentNameLabel,
      "type": -2,
      "type_name": "String"
    },

    "action_plan": {
      "key": "action_plan",
      "name": lang.documentStatusLabel,
      "type": -1,
      "type_name": "String"
    }
  };

  return EACEventListColumnsDefinition;
});

csui.define('xecmpf/models/eac/eventactionplans.model',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone',
  'csui/utils/url',
  'csui/models/mixins/connectable/connectable.mixin',
  'csui/models/mixins/expandable/expandable.mixin', 'csui/models/browsable/client-side.mixin',
  'csui/models/columns',
  'xecmpf/models/eac/eac.eventlist.columns.definitions'
], function (_, $, Backbone, Url, ConnectableMixin, ExpandableMixin, ClientSideBrowsableMixin,
  NodeColumnCollection, eacEventListColumnsDefinition) {

    var EACEventActionPlan = Backbone.Model.extend({

      idAttribute: '',

      constructor: function EACEventActionPlan(attributes, options) {
        options || (options = {});
        Backbone.Model.prototype.constructor.apply(this, arguments);
      },

      parse: function (response) {
        if(response) {
          response.has_action_plan = "false";
          if(response.action_plans) {
            response.has_action_plan = (!!response.action_plans.length).toString();
          }
        }
        return response;
      }
    });

    var EACEventActionPlans = Backbone.Collection.extend({

      model: EACEventActionPlan,

      constructor: function EACEventActionPlans(models, options) {
        this.options = options || {};
        Backbone.Collection.prototype.constructor.apply(this, arguments);
        this.makeConnectable(options)
          .makeClientSideBrowsable(options);
        this.columns = new NodeColumnCollection();
        this.columns.reset(this.getColumnModels());
      },

      url: function () {
        var url = this.connector.connection.url.replace('/v1', '/v2');
        url = Url.combine(url, 'eventactioncenter', 'actionplan') ;
        return url;
      },

      getColumnModels: function () {
        var definitions = eacEventListColumnsDefinition;
        var columnKeys = _.keys(definitions);
        var columns = _.reduce(columnKeys, function (colArray, column) {
          var definition = definitions[column];
          if (definition) {
            colArray.push(_.extend({ column_key: column }, definition));
          }
          return colArray;
        }, []);
        return columns;
      },

      parse: function (response) {
        var results = response.results.data;
        for (var i = 0; i < results.length; i++) {
          if (results[i].action_plan_count && parseInt(results[i].action_plan_count) > 0) {
            results[i].enableActionPlanCount = true;
          }
          results[i].eventIndexCount = i;
        }
        return results;
      }

    });

    ConnectableMixin.mixin(EACEventActionPlans.prototype);
    ClientSideBrowsableMixin.mixin(EACEventActionPlans.prototype);

    return EACEventActionPlans;
  });

csui.define('xecmpf/utils/commands/eac/eac.refresh',['csui/lib/underscore',
  "i18n!xecmpf/utils/commands/nls/localized.strings",
  "csui/utils/commandhelper", "csui/utils/commands/node",
  "csui/utils/command.error",
  'xecmpf/models/eac/eventactionplans.model',
  'csui/controls/globalmessage/globalmessage'
], function (_, lang, CommandHelper, NodeCommand, CommandError, EACEventActionPlans, GlobalMessage) {
  'use strict';

  var EACRefreshCommand = NodeCommand.extend({

    defaults: {
      signature: "EACRefresh",
      command_key: ['EACRefresh'],
    },

    //only one node allowed at a time
    enabled: function (status, options) {
      return true;
    },

    execute: function (status, options) {
      status.suppressSuccessMessage = true;
      status.suppressFailMessage = true;

      if (this.eacCollection) {
        this.eacCollection = null;
      }

      this.eacCollection = new EACEventActionPlans(undefined, _.extend({}, status.collection.options));

      var promise = this.eacCollection.fetch();

      promise.done(function () {
        status.collection.reset(this.eacCollection.models);
        GlobalMessage.showMessage('success', lang.Refresh);
      }.bind(this));
      promise.done().fail(function () {
        GlobalMessage.showMessage('error', lang.RefreshError);
      }
      )
      return promise;
    }
  });

  return EACRefreshCommand;

});


csui.define('xecmpf/utils/commands/eac/eac.back',["require", 'csui/lib/jquery', 'csui/utils/base', 'csui/lib/underscore',
  "i18n!csui/utils/commands/nls/localized.strings",
  "csui/utils/commandhelper", "csui/utils/commands/node",
  'csui/utils/command.error'
], function (require, $, base, _, lang, CommandHelper, NodeCommand, CommandError) {
  'use strict';

  var EACBackCommand = NodeCommand.extend({

    defaults: {
      signature: "EACBack",
      command_key: ['EACBack'],
    },

    enabled: function (status, options) {
      return true;
    },

    execute: function (status, options) {
      //Back command
    }
  });

  return EACBackCommand;

});

csui.define('xecmpf/utils/commands/open.eventaction',['require', 'csui/lib/jquery',
  'csui/models/command', 'csui/utils/commandhelper'
], function (require, $, CommandModel, CommandHelper) {
  'use strict';

  var OpenEventActionCommand = CommandModel.extend({

    defaults: {
      signature: 'OpenEventActionPage',
      command_key: ['default', 'open'],
      scope: 'single'
    },

    execute: function (status, options) {
      var deferred = $.Deferred();
      csui.require(
        ['csui/lib/underscore', 'csui/lib/backbone', 'csui/utils/contexts/factories/next.node',
          'csui/utils/contexts/factories/node'
        ], function (_, Backbone, NextNodeModelFactory, NodeModelFactory) {
          var context = status.context || options && options.context,
            nextNode = context.getModel(NextNodeModelFactory),
            currentNode = context.getModel(NodeModelFactory),
            node = CommandHelper.getJustOneNode(status);
          if (!!status.nodes.models[0].attributes &&
            status.nodes.models[0].attributes.type === 898) {
            
            nextNode.set('id', node.get('id'));
            
          }

          deferred.resolve();

          return deferred.promise();

        });
    }
  });

  return OpenEventActionCommand;

});

csui.define('xecmpf/utils/eventaction.defaultaction',[],function () {
    'use strict';
  
    return [
      
      {
        equals: {type: [898]},
        signature: 'OpenEventActionPage',
        sequence: 25
      }
    ];
  
  });
  
  
csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/commands/snapshot',[
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/models/command',
  'csui/utils/commandhelper',
  'i18n!xecmpf/utils/commands/nls/localized.strings'
], function ($, _, CommandModel, CommandHelper, lang) {

  var SnapshotCommand = CommandModel.extend({

    defaults: {
      signature: 'Snapshot',
      name: lang.CommandSnapshot,
      scope: 'multiple',
      doneVerb: lang.CommandDoneVerbCreated
    },

    enabled: function (status) {
      return status && status.container && status.nodes && status.nodes.length > 0;
    },

    execute: function (status, options) {
      status.suppressSuccessMessage = true;
      status.suppressFailMessage = true;

      var deferred  = $.Deferred(),
          container = status.container;

      csui.require(['csui/utils/url',
        'csui/utils/base',
        'csui/models/node/node.model',
        'csui/utils/contexts/factories/node',
        'csui/utils/contexts/factories/children',
        'csui/utils/contexts/factories/children2',
        'csui/controls/globalmessage/globalmessage',
        'csui/widgets/nodestable/nodestable.view',
        'csui/utils/contexts/factories/next.node',
        'csui/behaviors/default.action/default.action.behavior'
      ], function (Url, base, NodeModel, NodeModelFactory,
          ChildrenCollectionFactory, Children2CollectionFactory,
          GlobalMessage, NodesTableView, NextNodeModelFactory,
          DefaultActionBehavior) {

        // FormData available (IE10+, WebKit)
        var formData       = new FormData(),
            ids            = JSON.stringify(
                status.nodes.map(function (node) {
                  return node.get('id');
                })
            ).replace('[', '{').replace(']', '}'),
            isoDate        = base.formatISODateTime(new Date(new Date().getTime())),
            snapshotConfig = status.collection.options.data.snapshot || {},
            snapshotName   = status.collection.options.data.foldername || // for backwards-compatibility
                             snapshotConfig.folderNamePrefix || '';

        snapshotName = snapshotName.trim() + ' ' +
                       isoDate.substring(0, isoDate.indexOf('.')).replace(/T/g, ' ')
                           .replace(/:/g, '.');

        formData.append('body', JSON.stringify(_.extend({}, { // not adding undefined properties
          snapshot_parent_name: snapshotConfig.parentFolderName,
          snapshot_name: snapshotName,
          bus_attach_ids: ids
        })));

        var createSnapshotUrl = Url.combine(
            container.connector.connection.url.replace('/v1', '/v2'),
            'nodes', container.get('id'), 'snapshots'),
            ajaxOptions       = container.connector.extendAjaxOptions({
              type: 'POST',
              url: createSnapshotUrl,
              data: formData,
              contentType: false,
              processData: false
            });

        var context = status.context || options.context;
        $.ajax(ajaxOptions)
            .done(function (response, statusText, jqxhr) {
              if (NodesTableView.useV2RestApi) {
                ChildrenCollectionFactory = Children2CollectionFactory;
              }
              var node = context.getModel(NodeModelFactory);
              var children = context.getCollection(ChildrenCollectionFactory);
              var parentId = Math.abs(response.results[0].data.properties.parent_id);
              var newNode = new NodeModel(response.results[0].data.properties, {
                connector: container.connector
              });

              // if current node in the nodes table is the parent for the new node
              // update nodes table children collection
              if (node.get('id') === parentId) {
                newNode.isLocallyCreated = true;
                children.add(newNode, {at: 0});
                deferred.resolve();
              } else {
                // else if nodes table children collection already has the parent node
                // update the parent
                node = children.findWhere({id: parentId});
                if (node) {
                  node.fetch().always(deferred.resolve)
                } else {
                  deferred.resolve();
                }
              }
              var msgOptions = {
                  context: status.context,
                  nextNodeModelFactory: NextNodeModelFactory,
                  link_url: DefaultActionBehavior.getDefaultActionNodeUrl(newNode),
                  targetFolder: newNode
              };
              var message = _.str.sformat(lang.snapshotCreatedWithName, newNode.attributes.name);
              GlobalMessage.showMessage('success_with_link', message, undefined, msgOptions);

            })
            .fail(function (jqXHR, statusText, error) {
              var errmsg = jqXHR.responseJSON && (new base.Error(jqXHR.responseJSON)).error;
              GlobalMessage.showMessage('error', lang.snapshotFailed, errmsg);
              deferred.reject();
            });

      });
      return deferred.promise();
    }
  });

  return SnapshotCommand;
});

csui.define('xecmpf/utils/commands/collapse.page.overlay',['module',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/models/command',
  'i18n!xecmpf/utils/commands/nls/localized.strings',
], function (module, _, $, CommandModel, lang) {
  var CollapseDialog = CommandModel.extend({

    defaults: {
      signature: 'CollapsePageOverlay',
      name: lang.CollapsePageOverlay
    },
    enabled: function (status, options) {
      var config = _.extend({
        enabled: false,
      }, module.config());

      return config.enabled;
    },

    execute: function (status, options) {
      var parent = window.opener ? window.opener : window !== window.parent ? window.parent : undefined
      if (parent) {
        //Modal dialog invoking full page view listens for this event and closes itself
		// when full page view is opened from folderbrowse, folderbrowse's origin (integration system) need not necessarily be same as full page view's origin (CS). 
		// So setting the targetOrigin to "*" as we dont have access to the parent origin
        parent.postMessage({ "status": "closeDialog" }, "*");
      }
      var deferred = $.Deferred();
      return deferred.promise();
    }
  });

  return CollapseDialog;
});
csui.define('xecmpf/widgets/integration/folderbrowse/toolbaritems',[
  'i18n!xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',
  'css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse'
], function (FolderBrowseLang) {
  var toolbarItems = {
    leftToolbar: [
      {
        signature: "WorkspaceHistory",
        name: FolderBrowseLang.BackButtonToolItem,
        icon: "icon arrow_back "
      }
    ],
    rightToolbar: [
      {
        signature: "SearchFromHere",
        name: FolderBrowseLang.SearchToolItem,
        icon: "icon xecmpf-icon-search",
        group: "main",
        className: "csui-search-button"
      },
      {
        signature: "WorkspacePage",
        name: FolderBrowseLang.PageWidgetToolItem,
        icon: "icon csui-icon-open-full-page",
        group: "main",
        options: {
          hAlign: "right"
        },
        commandData: {applyTheme: true}
      }
    ]
  };
  return toolbarItems;
});

csui.define('csui-ext',['module', 'csui/lib/underscore'], function (module, _) {
  'use strict';

  var config = _.defaults({}, module.config(), {
    ignoreRequireErrors: false,
    // Modules in CS core (LES_MODULES) are tested together for every
    // quarterly update; they should be always compatible
    modulePrefixesToRetry: [
      'csui', 'classifications', 'esoc', 'wiki', 'workflow', 'webreports'
    ]
  });

  function handleSuccess(onLoad, parameters) {
    onLoad(Array.prototype.slice.call(parameters));
  }

  function handleError(error, onLoad) {
    if (config.ignoreRequireErrors) {
      console.error(error);
      console.warn('Loading extensions of "' + name +
                   '" failed:', error.requireModules);
      onLoad([]);
    } else {
      onLoad.error(error);
    }
  }

  function retryLoading(require, name, modules, onLoad, firstError) {
    var droppedModules = [],
        selectedModules = _.filter(modules, function (module) {
          var slash = module.indexOf('/');
          if (slash < 0 || _.contains(config.modulePrefixesToRetry,
                  module.substring(0, slash))) {
            return true;
          } else {
            droppedModules.push(module);
          }
        });
    if (selectedModules.length && droppedModules.length) {
      console.error(firstError);
      console.warn('Loading extensions of "' + name +
                   '" failed:', firstError.requireModules);
      console.warn('Dropping extensions:', droppedModules);
      console.warn('Retrying extensions:', selectedModules);
      require(selectedModules,
          function () {
            handleSuccess(onLoad, arguments);
          },
          function (error) {
            handleError(error, onLoad);
          });
      return true;
    }
  }

  return {
    load: function (name, require, onLoad, runtimeConfig) {
      if (runtimeConfig.isBuild) {
        onLoad();
      } else {
        var moduleConfig = runtimeConfig.config[name] || {},
            modules = moduleConfig.extensions;
        if (modules) {
          // Support either array of module names or a map with keys pointing
          // to arrays of module names; the latter can be used for decentralized
          // configuration (multiple calls to require.config, which can merge
          // maps only; not arrays)
          if (!_.isArray(modules)) {
            modules = Array.prototype.concat.apply([], _.values(modules));
          }
          if (modules.length) {
            require(modules,
                function () {
                  handleSuccess(onLoad, arguments);
                },
                function (error) {
                  if (!retryLoading(require, name, modules, onLoad, error)) {
                    handleError(error, onLoad);
                  }
                });
          } else {
            onLoad([]);
          }
        } else {
          onLoad();
        }
      }
    }
  };

});


csui.define('xecmpf/widgets/header/impl/previewpane/impl/previewpane.list.keyboard.behavior',['module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/utils/log', 'csui/lib/marionette'
], function (module, _, $, log, Marionette) {
  'use strict';

  // This behavior implements a default keyboard navigation for the simple list (fly-out)
  // in xecmpf header widget.

  var TabPosition = {
    none: -1,
    list: 1
  };

  var PreviewPaneListKeyboardBehavior = Marionette.Behavior.extend({

    constructor: function PreviewPaneListKeyboardBehavior(options, view) {
      Marionette.Behavior.prototype.constructor.apply(this, arguments);

      view.keyboardBehavior = this;
      this.tabableElements = [];

      var self = this;

      this.listenTo(view, 'show', function () {
        self.refreshTabableElements(view);
      });
      this.listenTo(view, 'click:item', function (item) {
        // clear the currently focused element
        var selIndex = view.selectedIndex;
        var selectedElem = view.selectedIndexElem(selIndex);
        selectedElem && selectedElem.prop('tabindex', '-1');
        // set the new element tabindex
        view.currentTabPosition = TabPosition.list;
        view.selectedIndex = view.collection.indexOf(item.model);
      });

      _.extend(view, {


        _focusList: function () {
          if (this.selectedIndex < 0 || this.selectedIndex === undefined) {
            this.selectedIndex = this.getSelectedIndex();
          }
          this.currentTabPosition = TabPosition.list;
          return this.getSelectedItem().$el;
        },

        _setFocus: function () {

            return this._focusList();
        },

        _listIsInFocus: function () {
          var inFocus = false;
          var i;
          for (i = 0; i < this.collection.length; i++) {
            var $elem = this.selectedIndexElem(i);
            if ($elem && $elem.is(":focus")) {
              inFocus = true;
              break;
            }
          }

          return inFocus;
        },

        _checkFocusAndSetCurrentTabPosition: function () {
          if (this._listIsInFocus()) {
            this.currentTabPosition = TabPosition.list;
          } else {
            this.currentTabPosition = TabPosition.none;
          }
        },

        // handle scenario that currentlyFocusedElement does not have event param for shiftTab
        _setFirstAndLastFocusable: function () {
          this.getSelectedItem() && this.getSelectedItem().$el.prop('tabindex', '0');
        },

        currentlyFocusedElement: function (event) {
          this._checkFocusAndSetCurrentTabPosition();
          this._setFirstAndLastFocusable();
          if (event && event.shiftKey) {
            return this._focusList();
          }
          // maintain old position
          if (this.currentTabPosition === TabPosition.list) {
            return this._focusList();
          } else {
            return this._setFocus();
          }
        },

        _resetFocusedListElem: function () {
          // workaround the general behaviors that it keeps the old focus
          // reset focus back to the active list item before moving out of the region
          var selIndex, selectedElem;

          // clear the currently focused element
          selIndex = this.selectedIndex;
          selectedElem = this.selectedIndexElem(selIndex);
          selectedElem && selectedElem.prop('tabindex', '-1');

          // set to the active element
          selIndex = this.getSelectedIndex();
          selectedElem = this.selectedIndexElem(selIndex);
          if (selectedElem) {
            selectedElem.prop('tabindex', '0');
            this.selectedIndex = selIndex;
          }
        },

        _moveTo: function (event, $elem, $preElem) {
          event.preventDefault();
          event.stopPropagation();
          setTimeout(_.bind(function () {
            $preElem && $preElem.prop('tabindex', '-1');
            $elem.prop('tabindex', '0');
            $elem.focus();
          }, this), 50);
        },

        onKeyInView: function (event) {
          this._checkFocusAndSetCurrentTabPosition();
          if (event.keyCode === 9) {
            // tab
            if (event.shiftKey) {  // shift tab -> activate previous region
              setTimeout(_.bind(function () {
                this._resetFocusedListElem();
              }, this), 50);
              // }
            }
          } else if (event.keyCode === 32 || event.keyCode === 13) {
            // space(32) or enter(13)
            if (this.currentTabPosition === TabPosition.list) {
              event.preventDefault();
              event.stopPropagation();
              this.selectAt(this.selectedIndex);
            }
          }
          else if (event.keyCode === 27) { // escape
            if (this.previewPane) {
              this.previewPane.hide();
              // reset focus to button of missing documents/displayUrl
              var but = this.previewPane.parent.$el.find('button');
              if (but){
                but.focus();
              }
            }
         }

        },

        onKeyDown: function (event) {
          if (this.config.debug === true) {
            console.log('preview-behavior: onKeydown - keyCode:' + event.which );
          }
          this._checkFocusAndSetCurrentTabPosition();
          if (this.currentTabPosition !== TabPosition.list) {
            this.onKeyInView(event);
            return;
          }

          var selIndex = this.selectedIndex;
          if (selIndex < 0 || selIndex === undefined) {
            selIndex = this.getSelectedIndex();
          }
          var $preElem = this.selectedIndexElem(selIndex);

          switch (event.which) {
          case 33: // page up
            this._moveTo(event, this._selectFirst(), $preElem);
            break;
          case 34: // page down
            this._moveTo(event, this._selectLast(), $preElem);
            break;
          case 38: // up
            this._moveTo(event, this._selectPrevious(), $preElem);
            break;
          case 40: // down
            this._moveTo(event, this._selectNext(), $preElem);
            break;
          default:
            this.onKeyInView(event);
            return; // exit this handler for other keys
          }
        },

        _selectFirst: function () {
          this.selectedIndex = 0;
          return this.selectedIndexElem(this.selectedIndex);
        },

        _selectLast: function () {
          this.selectedIndex = this.collection.length - 1;
          return this.selectedIndexElem(this.selectedIndex);
        },

        _selectNext: function () {
          if (this.selectedIndex < 0 || this.selectedIndex === undefined) {
            this.selectedIndex = this.getSelectedIndex();
          }
          if (this.selectedIndex < this.collection.length - 1) {
            this.selectedIndex++;
          }
          return this.selectedIndexElem(this.selectedIndex);
        },

        _selectPrevious: function () {
          if (this.selectedIndex < 0 || this.selectedIndex === undefined) {
            this.selectedIndex = this.getSelectedIndex();
          }
          if (this.selectedIndex > 0) {
            this.selectedIndex--;
          }
          return this.selectedIndexElem(this.selectedIndex);
        },

        selectAt: function (index) {
          if (index >= this.collection.length || index < 0) {
            return;
          }
          var $elem = this.selectedIndexElem(index);
          $elem && $elem.click();
        }

      });

    }, // constructor

    refreshTabableElements: function (view) {
      log.debug('PreviewPaneListKeyboardBehavior::refreshTabableElements ' +
                view.constructor.name) &&
      console.log(log.last);
      this.view.currentTabPosition = TabPosition.none;
      this.view.selectedIndex = -1;
    }

  });

  return PreviewPaneListKeyboardBehavior;
});

/**
 * Created by mtanwar on 26-07-2016.
 */

csui.define('xecmpf/widgets/header/impl/previewpane/impl/previewpane.list.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/controls/list/simplelist.view', 'csui/controls/node-type.icon/node-type.icon.view',
  'xecmpf/widgets/header/impl/previewpane/impl/previewpane.list.keyboard.behavior',
  'csui/dialogs/modal.alert/modal.alert'

], function (_, $, Backbone, Marionette,
    SimpleListView, NodeTypeIconView, PreviewPaneListKeyboardBehavior, ModalAlert) {

  var PreviewPaneListView = SimpleListView.extend({

    constructor: function PreviewPaneListView(options) {
      SimpleListView.prototype.constructor.apply(this, arguments);
    },

    behaviors: {
      PreviewPaneListKeyboardBehavior: {
        behaviorClass: PreviewPaneListKeyboardBehavior
      }
    },

    events: {
      'keydown': 'onKeyDown'
    },

    initialize: function (options) {
      options || (options = {});
      this.enableIcon = options.enableIcon;
      this.enableDescription = options.enableDescription;
      // for preview pane list keyboard behavior:
      this.previewPane = options.previewPane;
      // for debugging option
      this.config = options.config;

      this.listenTo(this, 'childview:render', this.onRenderItem);
      this.listenTo(this, 'childview:before:destroy', this.onBeforeDestroyItem);
      this.listenTo(this, 'click:item', this.onClickListItem);
    },

    childViewOptions: function (childViewModel) {
      return {
        templateHelpers: function () {
          return {
            enableIcon: this.enableIcon,
            enableDescription: this.enableDescription,
            name: childViewModel.get('name')
          };
        }.bind(this)
      };
    },

    onClickListItem: function (src) {
      var url   = src.model.get('displayUrl'),
          error = src.model.get('displayUrlError');
      if (error) {
        ModalAlert.showError(error);
      } else if (url) {
        var browserTab = window.open(url, '_blank');
        browserTab.focus();
      }
    },

    onRenderItem: function (childView) {
      childView._nodeIconView = new NodeTypeIconView({
        el: childView.$('.csui-type-icon').get(0),
        node: childView.model
      });
      childView._nodeIconView.render();
      if (this.options && childView.model
          && childView.model.attributes
          && childView.model.attributes.name
          && this.options.enableDescription) {
        var locHTML = '<div class="SLITitleDiv"><div class="SLITitle"><span title="' +
                      childView.model.attributes.name
                      + '">' +
                      childView.model.attributes.name
                      + '</span></div><div class="SLIDescription"><span title="' +
                      childView.model.attributes.classification_name
                      + '">' +
                      childView.model.attributes.classification_name
                      + '</span></div></div>';
        childView.$('.list-item-title').replaceWith(locHTML);
      }
      var displayUrl = childView.model.get('displayUrl');
      if ( displayUrl) {
        var a = childView.$el[0];
        a.href = displayUrl;
      }
    },

    onBeforeDestroyItem: function (childView) {
      if (childView._nodeIconView) {
        childView._nodeIconView.destroy();
      }
    }
  });

  return PreviewPaneListView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/header/impl/previewpane/impl/previewpane',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<div class=\"binf-panel-body xecmpf-preview-body\"></div>\r\n\r\n<div class=\"binf-panel-footer xecmpf-preview-footer\">"
    + this.escapeExpression(((helper = (helper = helpers.info || (depth0 != null ? depth0.info : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"info","hash":{}}) : helper)))
    + "</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_header_impl_previewpane_impl_previewpane', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/header/impl/previewpane/impl/previewpane',[],function(){});
csui.define('xecmpf/widgets/header/impl/previewpane/previewpane.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'csui/utils/base', 'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
  'xecmpf/widgets/header/impl/previewpane/impl/previewpane.list.view',
  'hbs!xecmpf/widgets/header/impl/previewpane/impl/previewpane', 'i18n',
  'css!xecmpf/widgets/header/impl/previewpane/impl/previewpane'
], function (_, $, Marionette,
    base, PerfectScrollingBehavior, LayoutViewEventsPropagationMixin,
    PreviewListView, template, i18n) {

  var PreviewPaneView = Marionette.LayoutView.extend({

    className: 'xecmpf-preview binf-panel binf-panel-default',

    constructor: function PreviewPaneView(options) {
      Marionette.LayoutView.prototype.constructor.call(this, options);
      options || (options = {});
      this.config = options.config;

      if (this.config) {
        // the related item view to show the preview for
        this.parent = options.parent;
        this.config.readonly = true;

        this.docsCollection = options.collection;
        this.headerTitle = options.headerTitle;
        this.footerInfoText = options.info;

        //---------------------------------------------------------------
        // setup binf-popover
        //---------------------------------------------------------------
        this.direction = i18n.settings.rtl ? 'left' : 'right';
        options.parent.$el.binf_popover({
          content: this.$el,
          placement: "auto " + this.direction,
          trigger: 'manual',
          container: 'body',
          html: true,
          // html accessiblity check: no empty headings are allowed
          // -> use pop-over title instead of our own missing documents header
          title: options.headerTitle
        });

        var $tip = this.parent.$el.data('binf.popover');
        var $pop = $tip.tip();
        var customPopoverClass = !options.customPopoverClass ? options.customPopoverClass : "";
        $pop.addClass('xecmpf-previewpane-popover').addClass(options.customPopoverClass);
        //Added a background colour to the header to match the colour of the MissingDocument/Outdated/InProcess icon
        if (options && options.headerColor) {
          if (this.config.debug === true) {
            console.log('add headerColor ' + options.headerColor + ' to ' +
                        $pop.find('.binf-popover-title'));
          }
          $pop.find('.binf-popover-title').addClass(options.headerColor);
        }

        //---------------------------------------------------------------
        // setup event handlers for binf-popover and its associated item view
        //---------------------------------------------------------------
        // SAPRM-11635:
        this.parent.$el.unbind('click').bind('click', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : Keyboard enter item');
          }
          this.show();
          // we have to set focus in simple list else keyboard navigation is
          // not working:
          var index = 0;
          var nthChildSel = _.str.sformat('div a:nth-child({0})', index + 1);
          var $item = this.docsListView.$(nthChildSel);
          $item[0].focus();
        }, this));

        this.parent.$el.unbind('mouseenter').bind('mouseenter', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : Mouseenter item');
          }
          this.show();
        }, this));

        this.parent.$el.unbind('keydown').bind('keydown', $.proxy(function () {
          if(event.keyCode === 13 || event.keyCode === 32  )
          {
            this.show();
          }
          if (event.keyCode === 27 && this.isRendered ){
          this._delayedHide();	
          }
        }, this));

        this.toggle = 0;
        this.parent.$el.on('touchend', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : touchend item');
          }

          if (!this.$el.is(":visible")) {
            this.toggle = 0;
          }

          if (this.toggle === 0) {
            this.show();
          } else if (this.toggle === 1) {
            this._delayedHide();
          }
        }, this));

        this.parent.$el.unbind('mouseleave').bind('mouseleave', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : Mouseleave item');
          }
          this._delayedHide();
        }, this));

        $pop.unbind('mouseenter').bind('mouseenter', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : Mouseenter binf-popover');
          }
          this.show();
        }, this));

        $pop.unbind('keydown').bind('keydown', $.proxy(function (event) {
          if(event.keyCode === 27){this._delayedHide();}
                  }, this));

        $pop.unbind('mouseleave').bind('mouseleave', $.proxy(function () {
          if (this.config.debug === true) {
            console.log('Preview : Mouseleave binf-popover');
          }
          this._delayedHide();
        }, this));

        this.propagateEventsToRegions();
        this.listenTo(this, 'dom:refresh', function () {
          this.options.parent.$el.binf_popover('show');
        });
      }
    },

    template: template,

    regions: {
      contentRegion: '.xecmpf-preview-body',
      footerRegion: '.xecmpf-preview-footer'
    },

    templateHelpers: function () {
      return {
        title: this.headerTitle,
        info: this.footerInfoText
      };
    },

    behaviors: {
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        contentParent: '.xecmpf-preview-body',
        suppressScrollX: true
      }
    },

    onBeforeDestroy: function (e) {
      if (this.config) {
        this.parent.$el.binf_popover('destroy');
      }
    },

    show: function () {
      if (this.config) {
        var that = this;

        if (this.config.debug === true) {
          console.log('Preview : Preparing show');
        }

        // clear hide timeout if there is one
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          if (this.config.debug === true) {
            console.log('Preview : Cleared hide timeout');
          }
          this.hideTimeout = null;
        }

        // nothing to do if already visible
        if (this.$el.is(":visible")) {
          if (this.config.debug === true) {
            console.log('Preview : Already visible');
          }
          return;
        }

        this.showCancelled = false;

        this.$el.hide();
        this.render();

        if (this.docsListView) {
          this.docsListView.destroy()
        }

        this.docsListView = new PreviewListView({
          collection: this.docsCollection,
          enableIcon: this.options.enableIcon,
          enableDescription: this.options.enableDescription,
          // for hiding in preview pane list keyboard behaviour
          previewPane: this,
          // for logging in preview pane list keyboard behaviour
          config: this.config
        });

        this.listenTo(this.docsListView, 'before:DefaultAction', function (args) {
          args.cancelDefaultAction = this.options.cancelDefaultAction
        });

        if (!this.showCancelled) {
          // in case of keyboard navigation this
          // closes every second time the popup
          // mouse hover is nevetheless working fine
          // therefore commented out
          // close all other preview popovers
          // $(".xecmpf-previewpane-popover").each(function (i, el) {
          //   var popoverId = $(el).attr('id');
          //   $("[aria-describedby^='" + popoverId + "']").binf_popover('hide');
          // });

          if (this.config.debug === true) {
            console.log('Preview : Showing');
          }

          // prepare and show binf-popover for this item
          this.contentRegion.show(this.docsListView, {
            render: true
          });
          this.$el.show();
          this.triggerMethod('before:show', this);
          this.toggle = 1;
          this.options.parent.$el.binf_popover('show');
          this.triggerMethod('show', this);

          if (this.config.debug === true) {
            console.log("Viewport height: " + $(window).height());
            console.log("document height: " + $(document).height());
            console.log("body     height: " + $('body').height());
            console.log("binf-popover  height: " + this.$el.height());
            console.log("list     height: " +
                        this.$el.find('.xecmpf-preview-body').height());
          }
        } else if (this.config.debug === true) {
          console.log('Preview : Show was cancelled');
        }
      }
    },

    hide: function () {
      if (this.config.debug === true) {
        console.log('Preview : Going to hide');
      }

      if (this.config && !this.config.debugNoHide) {
        if (this.config.debug === true) {
          console.log('Preview : Hidden');
        }
        this.toggle = 0;
        this.options.parent.$el.binf_popover('hide');
        this.hideTimeout = null;
      } else {
        if (this.config.debug === true) {
          console.log('Preview : Leaving visible');
        }
      }

      this.showCancelled = true;
      this.hideTimeout = null;
    },

    _delayedHide: function () {
      if (this.config.debug === true) {
        console.log('Preview : Setting hide timeout');
      }
      this.hideTimeout = window.setTimeout($.proxy(this.hide, this), 200);
    },

    onShow: function () {
      /**
       * to make the PerfectScrollingBehavior works for the simplelist.view,
       * the height needs to be set
       */
      this.$('.cs-simplelist.binf-panel').css('height',
          this.$('.binf-panel-body.xecmpf-preview-body').height());

      if (!this.footerInfoText) {
        $(this.regions.footerRegion).hide()
      }
    }
  });

  _.extend(PreviewPaneView.prototype, LayoutViewEventsPropagationMixin);

  return PreviewPaneView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheckitem',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "  <span class=\"csui-icon "
    + this.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"icon","hash":{}}) : helper)))
    + "\"></span>\r\n  <button class=\"count binf-btn binf-btn-default xecmpf-docscount-without-text\">"
    + this.escapeExpression(((helper = (helper = helpers.docsCount || (depth0 != null ? depth0.docsCount : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"docsCount","hash":{}}) : helper)))
    + "</button>\r\n  <button class=\"count binf-btn binf-btn-default xecmpf-docscount-with-text\">"
    + this.escapeExpression(((helper = (helper = helpers.docsCountWithText || (depth0 != null ? depth0.docsCountWithText : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"docsCountWithText","hash":{}}) : helper)))
    + "</button>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.docsCount : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_header_impl_completenesscheck_impl_completenesscheckitem', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheck',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "  <div class=\"missing-docs-check\"></div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.hideMissingDocsCheck : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_header_impl_completenesscheck_impl_completenesscheck', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/header/impl/completenesscheck/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});


csui.define('xecmpf/widgets/header/impl/completenesscheck/impl/nls/root/lang',{
  missingDocsTitle: "Missing documents",
  dialogTitle: "Reports",
  recentReportName: "Last 10 added documents",
  addedReportName: "Documents you added",
  missingReportName: "{0} missing",
  emptyMessage: "No documents to display"
});



csui.define('css!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheck',[],function(){});
csui.define('xecmpf/widgets/header/impl/completenesscheck/completenesscheck.view',[
  'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'conws/models/workspacecontext/workspacecontext.factory',
  'xecmpf/widgets/header/impl/completenesscheck/impl/missingdocuments.factory',
  //Load and register external views document items.
  'csui-ext!xecmpf/widgets/header/completenesscheck/completenesscheck.factory',
  'xecmpf/widgets/header/impl/previewpane/previewpane.view',
  'hbs!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheckitem',
  'hbs!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheck',
  'i18n!xecmpf/widgets/header/impl/completenesscheck/impl/nls/lang',
  'css!xecmpf/widgets/header/impl/completenesscheck/impl/completenesscheck'
], function (_, $, Backbone, Marionette, WorkspaceContextFactory,
    MissingDocumentsFactory, extraItems,
    PreviewPaneView, itemTemplate, layoutTemplate, lang) {

  var OUTDATED_DOCUMENTS_FACTORY = "selfserviceOutdatedCollection",
      INPROCESS_DOCUMENT_FACTORY = "selfserviceQueuedCollection";

  var DocsCheckItemView = Marionette.ItemView.extend({

    className: 'docs-check-list-item',

    constructor: function DocsCheckItemView(options) {
      options || (options = {});
      Marionette.ItemView.prototype.constructor.apply(this, arguments);

      this.listenTo(this.options.collection, 'change', this.render);

      if (this.options && this.options.preview) {
        this.previewPane = new PreviewPaneView({
          parent: this,
          context: this.options.workspaceContext,
          config: this.options.preview,
          collection: this.options.collection,
          headerTitle: this.options.title,
          enableIcon: this.options.enableIcon,
          headerColor: options.headerColor,
          enableDescription: options.enableDescription,
          info: this.options.info,
          cancelDefaultAction: this.options.cancelDefaultAction,
          customPopoverClass: this.options.customPopoverClass
        });
      }
    },

    template: itemTemplate,

    templateHelpers: function () {
      return {
        icon: this.options.icon,
        docsCount: this.options.collection.length,
        docsCountWithText: _.str.sformat(this.options.label, this.options.collection.length)
      }
    },

    onBeforeDestroy: function () {
      if (this.previewPane) {
        this.previewPane.destroy();
        delete this.previewPane;
      }
    }
  });

  var CompletenessCheckView = Marionette.LayoutView.extend({

    className: 'xecmpf-completenesscheck',

    constructor: function CompletenessCheckView(options) {
      options || (options = {});
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);

      if (!options.workspaceContext) {
        options.workspaceContext = options.context.getObject(WorkspaceContextFactory);
      }
      options.workspaceContext.setWorkspaceSpecific(MissingDocumentsFactory);

      this.missingDocsCollection = !options.hideMissingDocsCheck ?
                                   options.workspaceContext.getCollection(MissingDocumentsFactory) :
                                   undefined;
    },

    template: layoutTemplate,

    onRender: function () {
      this.showCompletenessCheck({
        collection: this.missingDocsCollection,
        title: lang.missingDocsTitle,
        label: lang.missingReportName,
        icon: 'missing-icon',
        index: 0,
        enableIcon: false,
        region: this.missingDocsRegion,
        enableDescription: false,
        cancelDefaultAction: true,
        customPopoverClass: 'xecmpf-missing-docs-check'
      });

      //Getting the external items
      this.showExternalViews(this.options);
    },

    regions: {
      missingDocsRegion: '.missing-docs-check'
    },

    showCompletenessCheck: function (options) {
      if (options.collection) {
        if (options.collection.fetched === true && options.collection.length > 0) {
          this._showCompletenessCheck(options);
        }
        this.listenToOnce(options.collection, 'sync', function () {
          if (options.collection.length > 0) {
            options.collection.fetched = true;
            this._showCompletenessCheck(options);
          }
        });
      }
    },

    _showCompletenessCheck: function (options) {
      this.showRegion = true;
      if (!options.region) {
        var regionClass0 = this.regionManager.completenesscheck_view0;
        var regionClass1 = this.regionManager.completenesscheck_view1;
        if ((regionClass0 && options.index === 0) || (regionClass1 && options.index === 1)) {
          this.showRegion = false;
        } else {
          var newRegion = 'completenesscheck_view' + options.index;
          this.addRegion(newRegion);
          options.region = this.regionManager[newRegion]
        }
      }
      if (this.showRegion) {
        options.region.show(new DocsCheckItemView({
          workspaceContext: this.options.workspaceContext,
          collection: options.collection,
          preview: {debug: false},
          title: options.title,
          label: options.label,
          icon: options.icon,
          headerColor: options.headerColor,
          enableIcon: options.enableIcon,
          enableDescription: options.enableDescription,
          cancelDefaultAction: options.cancelDefaultAction,
          customPopoverClass: options.customPopoverClass
        }));
      }
    },

    showExternalViews: function (options) {
      if (extraItems && extraItems.length > 0) {
        var collection,
            that = this;
        _.each(extraItems, function (item, index) {
          if (options.hideOutdatedDocsCheck &&
              item.prototype.propertyPrefix === OUTDATED_DOCUMENTS_FACTORY) { return; }
          if (options.hideInProcessDocsCheck &&
              item.prototype.propertyPrefix === INPROCESS_DOCUMENT_FACTORY) { return; }
          if (!options.workspaceContext) {
            options.workspaceContext = options.context.getObject(WorkspaceContextFactory);
          }
          options.workspaceContext.setWorkspaceSpecific(item);
          collection = options.workspaceContext.getCollection(item);
          that.showCompletenessCheck({
            collection: collection,
            title: collection.options.name,
            label: collection.options.label ? collection.options.label : collection.options.name,
            icon: collection.options.iconClass,
            headerColor: collection.options.headerColor,
            enableIcon: collection.options.enableIcon,
            enableDescription: collection.options.enableDescription,
            index: index,
            cancelDefaultAction: collection.options.cancelDefaultAction,
            customPopoverClass: collection.options.customPopoverClass
          });

        });
      }
    },

    addRegion: function (regionName) {
      if (!this.regionManager) {
        this.regionManager = {};
      }
      var that = this;
      var $el = $(this.el);
      $el.append($('<div></div>').attr({class: regionName}));
      // Manipulate the template - add the new region to the end.
      var temRegion = Marionette.Region.buildRegion($el.find('.' + regionName), Marionette.Region);
      temRegion.getEl = function (selector) {
        return that.$(selector);
      };
      this.regionManager[regionName] = temRegion;
    }

  });

  return CompletenessCheckView;
});



csui.define('xecmpf/widgets/header/headertoolbaritems',['module',
  'csui/lib/underscore',
  'csui/controls/toolbar/toolitems.factory',
  'csui/controls/toolbar/toolitem.model',
  'conws/widgets/header/impl/favorite.icon.view',
  'conws/widgets/header/impl/commenting.icon.view',
  'xecmpf/widgets/header/impl/completenesscheck/completenesscheck.view',
  'i18n!csui/controls/tabletoolbar/impl/nls/localized.strings',
  'i18n!xecmpf/utils/commands/nls/localized.strings',
  'csui-ext!xecmpf/widgets/header/headertoolbaritems'
], function (module, _, ToolItemsFactory, ToolItemModel, FavoriteIconView, CommentingIconView,
    CompletenessCheckView, Lang, CommandsLang, extraToolItems) {

  var headerToolbarItems = {

    rightToolbar: new ToolItemsFactory({
      main: [
        {
          signature: "SearchFromHere",
          name: CommandsLang.SearchWorkspace,
          icon: "icon xecmpf-icon-search",
          className: "csui-search-button",
          index: 1
        },
        {
          signature: "Comment",
          name: Lang.ToolbarItemComment,
          icon: "icon icon-socialComment",
          enabled: true,
          className: "esoc-socialactions-comment",
          customView: true,
          viewClass: CommentingIconView,
          commandData: {useContainer: true},
          index: 5
        },
        {
          signature: "Favorite2",
          enabled: true,
          viewClass: FavoriteIconView,
          customView: true,
          commandData: {useContainer: true},
          index: 6
        }
      ],
      completeness: [
        {
          signature: "CompletenessCheck",
          enabled: true,
          viewClass: CompletenessCheckView,
          customView: true,
          commandData: {useContainer: true},
          index: 2
        }
      ]
    })
  };

  if (!!extraToolItems) {
    _.each(extraToolItems, function (moduleToolItems) {
      _.each(moduleToolItems, function (toolItems, key) {
        var targetToolbar = headerToolbarItems[key];
        if (!!targetToolbar) {
          _.each(toolItems, function (toolItem) {
            toolItem = new ToolItemModel(toolItem);
            targetToolbar.addItem(toolItem);
          });
        }
      });
    });
  }

  headerToolbarItems['rightToolbar'].collection.comparator = function (model) {
    return model.get('index');
  }
  headerToolbarItems['rightToolbar'].collection.sort();
  return headerToolbarItems;

});


csui.define('xecmpf/widgets/header/commonheadertoolbaritems',[
  'i18n!xecmpf/utils/commands/nls/localized.strings',
], function (CommandsLang) {
  var headerToolbarItems = {
    rightToolbar: [
      {
        signature: "CollapsePageOverlay",
        name: CommandsLang.CollapsePageOverlay,
        icon: "icon xecmpf-collapse-icon",
		className: "xecmpf-collapse",
        index: 7,
        group: 'main'
      }
    ]
  };

  return headerToolbarItems;
});

csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/tablecell/createdby.view',[
  'csui/lib/underscore', 'csui/controls/table/cells/cell/cell.view',
  'csui/controls/table/cells/cell.registry', 'csui/utils/base'
], function (_, CellView, cellViewRegistry, base) {
  'use strict';

  var MemberCellView = CellView.extend({
    className: 'csui-truncate',

    getValueText: function () {
      return MemberCellView.getValue(this.model, this.options.column);
    }
  }, {
    getValue: function (model, column) {
      var columnName = column.name,
          value = model.get(columnName + "_expand") ||
                  model.get(columnName) || '',
          text;
      if (_.isObject(value)) {
        // Prefer the expanded user information
        text = base.formatMemberName(value);
      } else {
        // Then try the server-pre-formatted value and fall back to the id
        text = model.get(columnName + "_formatted") || value.toString();
      }
      return text;
    },

    getModelExpand: function (options) {
      return {properties: [options.column.name]};
    }
  });

  cellViewRegistry.registerByDataType(14, MemberCellView);
  cellViewRegistry.registerByDataType(19, MemberCellView);
  cellViewRegistry.registerByColumnKey('createdby', MemberCellView);

  return MemberCellView;
});

csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/tablecell/modifiedby.view',[
  'csui/lib/underscore', 'csui/controls/table/cells/cell/cell.view',
  'csui/controls/table/cells/cell.registry', 'csui/utils/base'
], function (_, CellView, cellViewRegistry, base) {
  'use strict';

  var MemberCellView = CellView.extend({
    className: 'csui-truncate',

    getValueText: function () {
      return MemberCellView.getValue(this.model, this.options.column);
    }
  }, {
    getValue: function (model, column) {
      var columnName = column.name,
          value = model.get(columnName + "_expand") ||
                  model.get(columnName) || '',
          text;
      if (_.isObject(value)) {
        // Prefer the expanded user information
        text = base.formatMemberName(value);
      } else {
        // Then try the server-pre-formatted value and fall back to the id
        text = model.get(columnName + "_formatted") || value.toString();
      }
      return text;
    },

    getModelExpand: function (options) {
      return {properties: [options.column.name]};
    }
  });

  cellViewRegistry.registerByDataType(14, MemberCellView);
  cellViewRegistry.registerByDataType(19, MemberCellView);
  cellViewRegistry.registerByColumnKey('modifiedby', MemberCellView);

  return MemberCellView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(data && data.last),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    return "<div class=\"carousel-nav-dot\"></div>\r\n";
},"4":function(depth0,helpers,partials,data) {
    return "<div class=\"carousel-nav-dot\"></div>\r\n<div class=\"carousel-nav-dash\"></div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_carousel.nav_carousel.nav', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav',[],function(){});
csui.define('xecmpf/widgets/eac/impl/carousel.nav/carousel.nav.view',['csui/lib/jquery', 'csui/lib/marionette',
  'hbs!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav',
  'css!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav'
], function ($, Marionette, template) {
  'use strict';

  var CarouselNavView = Marionette.ItemView.extend({

    className: 'carousel-nav',

    template: template,

    constructor: function CarouselView(options) {
      options || (options = {});
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
      this.count = options.count;
      this.active = options.active;
    },

    ui: {
      navDots: '>.carousel-nav-dot'
    },

    templateHelpers: function () {
      return {
        items: new Array(this.count)
      };
    },

    onRender: function () {
      if (this.active !== undefined) {
        $(this.ui.navDots[this.active]).addClass('active');
      }
    },

    onBack: function () {
      if (this.active > 0) {
        this.ui.navDots.removeClass('active');
        $(this.ui.navDots[--this.active]).addClass('active');
      }
    },

    onNext: function () {
      if (!this.active) {
        this.active = 0;
      }
      if (this.active < this.count - 1) {
        this.ui.navDots.removeClass('active');
        $(this.ui.navDots[++this.active]).addClass('active');
      }
    }

  });

  return CarouselNavView;
});

csui.define('xecmpf/models/eac/eac.planproperties.model',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone',
    'csui/models/mixins/connectable/connectable.mixin',
    'csui/models/mixins/fetchable/fetchable.mixin',
    'csui/utils/url',
], function (_, $, Backbone, ConnectableMixin, FetchableMixin, Url) {

    var EACPlanPropertiesModel = Backbone.Model.extend({
        constructor: function EACPlanPropertiesModel(attributes, options) {
            this.options = options || {};
            Backbone.Model.prototype.constructor.apply(this, arguments);
            this.makeConnectable(options);
        },
        parse: function (response) {
            return response;
        }
    });
    ConnectableMixin.mixin(EACPlanPropertiesModel.prototype);

    var EACPlanPropertiesCollection = Backbone.Collection.extend({

        model: EACPlanPropertiesModel,

        constructor: function EACPlanPropertiesCollection(models, options) {
            this.options = options || {};
            Backbone.Collection.prototype.constructor.apply(this, arguments);
            this.makeConnectable(options)
                .makeFetchable(options);
        },

        url: function () {
            var url = this.connector.connection.url.replace('v1', 'v2');
            url = Url.combine(url, 'eventactioncenter', 'eventproperties');
            return url + this.queryParamsToString(this.options.query);
        },

        parse: function (response) {
            return response.results.data;
        },

        queryParamsToString: function (params) {
            var query = '';
            if (!_.isEmpty(params)) {
                query = '?' + $.param(params);
            }
            return query.replace(/%5B%5D/g, '');
        }
    });

    ConnectableMixin.mixin(EACPlanPropertiesCollection.prototype);
    FetchableMixin.mixin(EACPlanPropertiesCollection.prototype);

    return EACPlanPropertiesCollection;
});

csui.define('xecmpf/models/eac/eac.planproperties.factory',['csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/connector',
  'xecmpf/models/eac/eac.planproperties.model'
], function (_, Backbone,
  CollectionFactory, ConnectorFactory,
  EACPlanPropertiesCollection) {
    var EACPlanPropertiesFactory = CollectionFactory.extend({
      propertyPrefix: 'EACPlanPropertiesCollection',
      constructor: function EACPlanPropertiesFactory(context, options) {
        CollectionFactory.prototype.constructor.apply(this, arguments);
        var eacCollection = this.options.EACPlanPropertiesCollection || {};
        if (!(eacCollection instanceof Backbone.Collection)) {
          var namespace;
          var event_name;
          if(options.eventModel.get){
            namespace = options.eventModel.get('namespace');
            event_name = options.eventModel.get('event_name');
          } else {
            namespace = options.eventModel.attributes.namespace;
            event_name = options.eventModel.attributes.event_name;
          }
          eacCollection = new EACPlanPropertiesCollection(eacCollection.models, _.extend({
            connector: context.getModel(ConnectorFactory),
            query: {
              event_name: event_name,
              system_name: namespace
            },
            autofetch: true
          }, eacCollection.options));
        }
        this.property = eacCollection;
      },
      fetch: function (options) {
        return this.property.fetch(options);
      }
    });
    return EACPlanPropertiesFactory;
  });
'use strict'

csui.define('xecmpf/widgets/eac/impl/actionplan/add/rule.form.model',['csui/lib/underscore', 'csui/models/form',
    'xecmpf/models/eac/eac.planproperties.factory',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (_, FormModel, EACPlanPropertiesFactory, lang) {

    var EACRuleFormModel = FormModel.extend({

        constructor: function EACRuleFormModel(attributes, options) {
            this.options = options || (options = {});
            attributes || (attributes = {
                data: {},
                schema: {properties: {}},
                options: {fields: {}}
            });
            this.conjunction = '';
            this.operand = '';
            this.operator = '';
            this.position = '';
            this.value = '';
            if (this.options.rules) {
                this.conjunction = this.options.rules.conjunction;
                this.operand = this.options.rules.operand;
                this.operator = this.options.rules.operator;
                this.position = this.options.rules.position;
                this.value = this.options.rules.value;
            }

            FormModel.prototype.constructor.call(this, attributes, options);
        },

        initialize: function (attributes, options) {
            if (_.isEmpty(attributes.data)) {
                var namespace;
              var event_name;
              if(options.eventModel.get){
                namespace = options.eventModel.get('namespace');
                event_name = options.eventModel.get('event_name');
              } else {
                namespace = options.eventModel.attributes.namespace;
                event_name = options.eventModel.attributes.event_name;
              }

                var eacPlanProperties = options.context.getCollection(EACPlanPropertiesFactory, {
                    eventModel: options.eventModel,
                    // EAC plan properties are unique by namespace and event_name both
                    attributes: {
                        namespace: namespace,
                        event_name: event_name
                    }
                });

                if (!eacPlanProperties.planProperties) {
                    this.listenToOnce(eacPlanProperties, 'sync', function () {
                        eacPlanProperties.planProperties = eacPlanProperties.map(function (model) {
                            return model.get('name');
                        });
                        this._setAttributes(eacPlanProperties.planProperties);
                    });
                    eacPlanProperties.fetch();
                } else {
                    this._setAttributes(eacPlanProperties.planProperties);
                }
            }
        },

        _setAttributes: function (planProperties) {
            var that = this;

            this.set({
                data: {
                    from: this.operand,
                    operator: this.operator,
                    to: this.value,
                    conjunction: this.conjunction
                            //value: this.value
                },
                schema: {
                    properties: {
                        from: {
                            enum: planProperties,
                            required: true,
                            type: "string"
                        },
                        operator: {
                            enum: ['Equal to', 'Not equal to'],
                            required: true,
                            type: "string"
                        },
                        to: {
                            minLength: 1,
                            maxLength: 248,
                            required: true,
                            type: "string"

                        },
                        conjunction: {
                            enum: ['And', 'Or'],
                            required: false,
                            type: "string"
                        }
                    }
                },
                options: {
                    fields: {
                        from: {
                            label: "",
                            type: "select",
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        },
                        operator: {
                            label: "",
                            type: "select",
                            optionLabels: [lang.operatorEqualtoLabel, lang.operatorNotequaltoLabel],
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        },
                        to: {
                            label: "",
                            type: "text",
                            events: {
                                change: function () {
                                    setTimeout(function () {
                                        that.setValue(this.path, this.getValue());
                                    }.bind(this), 0);
                                }
                            }
                        },
                        conjunction: {
                            label: "",
                            type: "select",
                            optionLabels:  [lang.conjunctionAndLabel, lang.conjunctionOrLabel],
                            events: {
                                change: function (e) {
                                    that.setValue(this.path, this.getValue());
                                    if (that.options.selectCallback && typeof that.options.selectCallback === 'function') {
                                        that.options.selectCallback(e, that);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    return EACRuleFormModel;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/emptyruleslist/impl/emptyrules.list.item',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"xecmpf-eac-rules\">\r\n    <span class=\"xecmpf-eac-rules-empty\">"
    + this.escapeExpression(((helper = (helper = helpers.emptyRules || (depth0 != null ? depth0.emptyRules : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"emptyRules","hash":{}}) : helper)))
    + "</span>\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_emptyruleslist_impl_emptyrules.list.item', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/eac/impl/eac',[],function(){});
csui.define('xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',[
    'csui/lib/marionette',
    'hbs!xecmpf/widgets/eac/impl/emptyruleslist/impl/emptyrules.list.item',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (Marionette, template, lang) {
    var EACEmptyRulesItemView = Marionette.ItemView.extend({
        template: template,

        templateHelpers: function () {
            return{
                emptyRules: this.options.noRules ? lang.noRulesDefined : ''
            };
        },

        constructor: function EACEmptyRulesItemView(options) {
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);
        }
    });

    return EACEmptyRulesItemView;
});




/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/rule',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "\r\n<div class='eac-rules-list'>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.noRules : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0)})) != null ? stack1 : "")
    + "</div>\r\n\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "  <span class='eac-rules-list-norules'>"
    + this.escapeExpression(((helper = (helper = helpers.noRulesDef || (depth0 != null ? depth0.noRulesDef : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"noRulesDef","hash":{}}) : helper)))
    + "</span>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "  <span class='eac-rules-list-name'>"
    + this.escapeExpression(((helper = (helper = helpers.ruleName || (depth0 != null ? depth0.ruleName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"ruleName","hash":{}}) : helper)))
    + "</span>\r\n  <span class='eac-rules-list-operator'>"
    + this.escapeExpression(((helper = (helper = helpers.operator || (depth0 != null ? depth0.operator : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"operator","hash":{}}) : helper)))
    + "</span>\r\n  <span class='eac-rules-list-value' title="
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{}}) : helper)))
    + ">"
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{}}) : helper)))
    + "</span>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<div class='eac-rule-header'>\r\n  <h5 class='eac-rule-title'>"
    + this.escapeExpression(((helper = (helper = helpers.conditionLabel || (depth0 != null ? depth0.conditionLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"conditionLabel","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.sequence || (depth0 != null ? depth0.sequence : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"sequence","hash":{}}) : helper)))
    + "</h5>\r\n  <button class='xecmpf-eac-rule-delete csui-icon eac-delete-icon' aria-hidden=\"true\"></button>\r\n</div>\r\n<div class=\"xecmpf-eac-rule-form\"></div>\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(6, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_rule', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/rules',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<h2 class=\"xecmpf-eac-rules-header\">"
    + this.escapeExpression(((helper = (helper = helpers.rulesLabel || (depth0 != null ? depth0.rulesLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"rulesLabel","hash":{}}) : helper)))
    + "</h2>\r\n<div class=\"xecmpf-eac-rules-container\"></div>\r\n\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "<div class=\"csui-perfect-scrolling xecmpf-eac-rules-form\">\r\n    <div class=\"xecmpf-eac-rules-container\"></div>\r\n</div>\r\n\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_rules', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/actionplan/add/rules.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
    'csui/utils/contexts/factories/connector', 'csui/controls/form/form.view', 'csui/controls/progressblocker/blocker',
    'xecmpf/widgets/eac/impl/actionplan/add/rule.form.model',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/rule',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/rules',
    'csui/controls/globalmessage/globalmessage',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'csui/utils/deepClone/deepClone'
], function (_, $, Backbone, Marionette,
        ConnectorFactory, FormView, BlockingView,
        EACRuleFormModel, EACEmptyRulesItemView, PerfectScrollingBehavior,
        ruleTemplate, rulesTemplate, GlobalMessage, lang) {

    var EACRuleView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-rule',
        template: ruleTemplate,
        templateHelpers: function () {
            return {
                summary: this.options.summary,
                ruleName: this.model.attributes.formModel.attributes.data.from,
                operator: this.model.attributes.formModel.attributes.data.operator,
                value: this.model.attributes.formModel.attributes.data.to,
                noRules: this.options.noRules,
                noRulesDef: lang.noRulesDefined,
                conditionLabel: lang.conditionLabel
            };
        },

        initialize: function (options) {
            if (!options.summary) {
                this.formView = new FormView({
                    context: this.options.context,
                    layoutMode: 'singleCol',
                    mode: 'create',
                    model: this.model.get('formModel')
                });
                BlockingView.imbue(this.formView);
            }
        },
        regions: {
            ruleForm: '.xecmpf-eac-rule-form'
        },
        events: {
            'click .xecmpf-eac-rule-delete': '_deleteRule',
            'click .xecmpf-eac-rule-copy': '_copyRule'
        },
        _deleteRule: function () {
            if (this._parent.collection.length > 1) {
                var parentObj = this._parent;
                this.model.destroy();
                var i;
                parentObj.collection.forEach(function (model, index) {
                    i = ++index;
                    model.set('sequence', i);
                    model.get('formModel').options.sq = i;
                });
                parentObj.collection.models[i - 1].attributes.formModel.attributes.data.conjunction = "";
                parentObj.render();
            } else {
                GlobalMessage.showMessage('warning', lang.warningMsgondeletionOfLast1Rule);
            }
        },
        /* _copyRule: function () {
         var that = this;
         if (this.formView.validate()) {
         var formModelAttrs = _.deepClone(this.model.get('formModel').attributes);
         var model = new Backbone.Model({
         sequence: this.model.collection.length + 1,
         formModel: new EACRuleFormModel(formModelAttrs, {
         context: this.options.context,
         eventModel: this.options.eventModel,
         sq:this.model.collection.length + 1,
         selectCallback: function (e, modelObj) {
         that._parent.actionPlanSelected(e, modelObj);
         }
         })
         });
         this.model.collection.add(model);
         }
         
         },*/
        onRender: function () {
            if (this.formView) {
                this.showChildView('ruleForm', this.formView);
                this.formView.blockActions();
                var that = this;
                this.listenTo(this.formView, 'render', function () {
                    that.formView.unblockActions();
                });
            }

        },
        getSubmitData: function () {
            if (this.formView.getValues().from !== ''
                    && this.formView.getValues().operator !== '' && this.formView.getValues().to !== '') {
                return this.formView.getValues();
            }
        }
    });
    var EACRulesView = Marionette.CompositeView.extend({

        className: 'xecmpf-eac-rules',
        template: rulesTemplate,
        templateHelpers: function () {
            return {
                summary: this.options.summary,
                rulesLabel: lang.rulesLabel
            };
        },
        region: {
            rulesRegion: '.xecmpf-eac-rules-container'
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-rules-form',
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },
        
        initialize: function (options) {
            var model;
            var that = this;
            if (!options.collection) {
                this.collection = new Backbone.Collection();
                if (options.eventModel.fromEdit) {
                    var rules = this.options.eventModel.get('rules'), i;
                    if (rules.length === 0) {
                        model = new Backbone.Model({
                            sequence: 1,
                            formModel: new EACRuleFormModel(undefined, {
                                context: this.options.context,
                                eventModel: this.options.eventModel,
                                sq: 1,
                                selectCallback: function (e, modelObj) {
                                    that.actionPlanSelected(e, modelObj);
                                }
                            })
                        });
                        this.collection.add(model);
                    } else {
                        for (i = 0; i < rules.length; i++) {
                            model = new Backbone.Model({
                                sequence: i + 1,
                                formModel: new EACRuleFormModel(undefined, {
                                    context: this.options.context,
                                    eventModel: this.options.eventModel,
                                    sq: i + 1,
                                    rules: rules[i],
                                    selectCallback: function (e, modelObj) {
                                        that.actionPlanSelected(e, modelObj);
                                    }
                                })
                            });
                            this.collection.add(model);
                        }
                    }

                } else {
                    model = new Backbone.Model({
                        sequence: 1,
                        formModel: new EACRuleFormModel(undefined, {
                            context: this.options.context,
                            eventModel: this.options.eventModel,
                            sq: 1,
                            selectCallback: function (e, modelObj) {
                                that.actionPlanSelected(e, modelObj);
                            }
                        })
                    });
                    this.collection.add(model);
                }
            }

            this.listenTo(this, "changeCong", function (e, modelObj) {
                //New rule is created only when the selection of conjunction of last rule.
                if (this.collection && this.collection.length === modelObj.options.sq) {
                    this.addNewRule();
                }
            })

        },
        actionPlanSelected: function (e, modelObj) {
            if (modelObj.attributes.data.conjunction !== '') {
                this.trigger("changeCong", e, modelObj);
            }
        },
        emptyView: EACEmptyRulesItemView,

        emptyViewOptions: function () {
            return this.options;
        },

        addNewRule: function () {
            var isValid = true;
            var that = this;
            _.map(this.children._views, function (childView) {
                if (childView.formView) {
                    if (!childView.formView.validate()) {
                        isValid = false;
                        var emptyModel = new Backbone.Model({
                            id: null,
                            name: "<None>"
                        });
                        childView.formView.form.childrenByPropertyId['conjunction'].fieldView.setValue(emptyModel);
                    }
                }
            });
            if (isValid) {
                var model = new Backbone.Model({
                    sequence: this.collection.length + 1,
                    formModel: new EACRuleFormModel(undefined, {
                        context: this.options.context,
                        eventModel: this.options.eventModel,
                        sq: this.collection.length + 1,
                        selectCallback: function (e, modelObj) {
                            that.actionPlanSelected(e, modelObj);
                        }
                    })
                });
                this.collection.add(model);
            }

        },

        childViewContainer: '.xecmpf-eac-rules-container',
        childView: EACRuleView,
        childViewOptions: function () {
            return {
                context: this.options.context,
                eventModel: this.options.eventModel,
                summary: this.options.summary,
                noRules: this.options.noRules
            };
        },
        getSummaryData: function () {
            return this.collection;
        },
        getSubmitData: function () {
            return _.map(this.children._views, function (childView) {
                return childView.getSubmitData();
            });
        }
    });
    return EACRulesView;
});
csui.define('xecmpf/models/eac/eac.defaultplans.model',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone',
    'csui/models/mixins/connectable/connectable.mixin',
    'csui/models/mixins/fetchable/fetchable.mixin',
    'csui/utils/url'
], function (_, $, Backbone, ConnectableMixin, FetchableMixin, Url) {

    var EACDefaultPlansModel = Backbone.Model.extend({
        constructor: function EACDefaultPlansModel(attributes, options) {
            options || (options = {});
            Backbone.Model.prototype.constructor.apply(this, arguments);
            this.makeConnectable(options);
        },
        parse: function (response) {
            return response;
        }
    });
    ConnectableMixin.mixin(EACDefaultPlansModel.prototype);

    var EACDefaultPlansCollection = Backbone.Collection.extend({

        model: EACDefaultPlansModel,

        constructor: function EACDefaultPlansCollection(models, options) {
            this.options = options || {};
            Backbone.Collection.prototype.constructor.apply(this, arguments);
            this.makeConnectable(options)
                .makeFetchable(options);
        },

        url: function () {
            var url = this.connector.connection.url.replace('v1', 'v2');
            url = Url.combine(url, 'eventactioncenter', 'actions');
            return url + this.queryParamsToString(this.options.query);
        },

        parse: function (response) {
            return response.results.actions;
        },

        queryParamsToString: function (params) {
            var query = '';
            if (!_.isEmpty(params)) {
                query = '?' + $.param(params);
            }
            return query.replace(/%5B%5D/g, '');
        }
    });

    ConnectableMixin.mixin(EACDefaultPlansCollection.prototype);
    FetchableMixin.mixin(EACDefaultPlansCollection.prototype);

    return EACDefaultPlansCollection;
});

csui.define('xecmpf/models/eac/eac.defaultplans.factory',['csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/connector',
  'xecmpf/models/eac/eac.defaultplans.model'
], function (_, Backbone,
  CollectionFactory, ConnectorFactory,
  EACDefaultPlansCollection) {

    var EACDefaultPlansFactory = CollectionFactory.extend({
      propertyPrefix: 'EACDefaultPlansCollection',
      constructor: function EACDefaultPlansFactory(context, options) {
        CollectionFactory.prototype.constructor.apply(this, arguments);
        var eacCollection = this.options.EACDefaultPlansCollection || {};
        if (!(eacCollection instanceof Backbone.Collection)) {
          eacCollection = new EACDefaultPlansCollection(eacCollection.models, _.extend({
            connector: context.getModel(ConnectorFactory),
            autofetch: true
          }, eacCollection.options));
        }
        this.property = eacCollection;
      },
      fetch: function (options) {
        return this.property.fetch(options);
      }
    });

    return EACDefaultPlansFactory;
  });
'use strict'

csui.define('xecmpf/widgets/eac/impl/actionplan/add/action.form.model',['csui/lib/jquery', 'csui/lib/backbone', 'csui/models/form',
    'xecmpf/models/eac/eac.defaultplans.factory', 'xecmpf/models/eac/eac.planproperties.factory',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
], function ($, Backbone, FormModel, EACDefaultPlansFactory, EACPlanPropertiesFactory, lang) {

    var EACActionFormModel = FormModel.extend({

        constructor: function EACActionFormModel(attributes, options) {
            this.options = options || (options = {});
            attributes || (attributes = {
                data: {},
                schema: {properties: {}},
                options: {fields: {}}
            });
            this.action_key = '';
            if (this.options.actions) {
                this.action_name = this.options.actions.action_name;
                this.action_key = this.options.actions.action_key;
            } else if (attributes && attributes.data && attributes.data.action) {
                this.action_key = attributes.data.action;
            }
            FormModel.prototype.constructor.call(this, attributes, options);
        },

        initialize: function (attributes, options) {
            var promises = [];
            var eacDefaultPlans = options.context.getCollection(EACDefaultPlansFactory);
            var namespace;
            var event_name;
            if (options.eventModel.get) {
                namespace = options.eventModel.get('namespace');
                event_name = options.eventModel.get('event_name');
            } else {
                namespace = options.eventModel.attributes.namespace;
                event_name = options.eventModel.attributes.event_name;
            }

            var eacPlanProperties = options.context.getCollection(EACPlanPropertiesFactory, {
                eventModel: options.eventModel,
                // EAC plan properties are unique by namespace and event_name both
                attributes: {
                    namespace: namespace,
                    event_name: event_name
                }
            });

            if (!eacDefaultPlans.fetched) {
                promises.push(eacDefaultPlans.fetch());
            }

            if (!eacPlanProperties.planProperties) {
                promises.push(eacPlanProperties.fetch());
            }

            $.when.apply($, promises).done(function () {
                eacPlanProperties.planProperties = eacPlanProperties.map(function (model) {
                    return model.get('name');
                });

                if (attributes && attributes.data && attributes.data.action) {
                    this.set(attributes);
                } else {
                    this._setAttributes(eacDefaultPlans, eacPlanProperties.planProperties);
                }
            }.bind(this));
        },

        _setAttributes: function (eacDefaultPlans, planProperties) {
            var that = this;
            var attributes = {
                data: {
                    action: that.action_key
                },
                schema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            required: true
                        }
                    }
                },
                options: {
                    fields: {
                        action: {
                            type: 'select',
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        }
                    }
                }
            };

            var actionFieldEnum = [], actionFieldLabels = [];
            var actions = '', attributeMappings = '';
            if (this.options.actions) {
                actions = this.options.actions;
                attributeMappings = this.options.actions.attribute_mappings;
            }
            for (var k = 0; k < eacDefaultPlans.models.length; k++) {
                var key = eacDefaultPlans.models[k].get('action_key');
                actionFieldEnum.push(key);
                actionFieldLabels.push(eacDefaultPlans.models[k].get('action_name'));

                if (eacDefaultPlans.models[k].get('actions_attributes').length > 0) {
                    var schema = attributes.schema;
                    schema.properties[key + '_fields'] = {properties: {}, dependencies: "action"};
                    var properties = schema.properties[key + '_fields'].properties;

                    var options = attributes.options;
                    options.fields[key + '_fields'] = {fields: {}, dependencies: {action: key}};
                    var fields = options.fields[key + '_fields'].fields;

                    var data = attributes.data[key + '_fields'] = {};

                    for (var i = 0; i < eacDefaultPlans.models[k].get('actions_attributes').length; i++) {
                        var fieldKey = eacDefaultPlans.models[k].attributes.actions_attributes[i].key;//key + '_fields_' + i;
                        var source = '', propVal = '',
                                resultsfromprev = 'Result from previous action';
                        if (this.options.actions) {
                            if (i <= this.options.actions.attribute_mappings.length - 1) {
                                source = this.options.actions.attribute_mappings[i].mapping_method;
                                propVal = this.options.actions.attribute_mappings[i].mapping_data;
                            }
                        }
                        if (source === 'Content Server Object') {
                            source = "csObj";
                        } else if (source === 'Event Property') {
                            source = "evtProp";
                        } else if (source === 'Result from previous Action') {
                            source = "prevAct";
                        }

                        properties[fieldKey] = {
                            properties: {
                                source: {
                                    type: "string",
                                    enum: ["csObj", "evtProp", "prevAct"]
                                },
                                properties_label: {
                                    dependencies: "source",
                                    type: "string",
                                    readonly: true
                                },
                                csObj_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true
                                },
                                evtProp_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true,
                                    enum: planProperties
                                },
                                prevAct_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true,
                                    readonly: true
                                }
                            }
                        };

                        fields[fieldKey] = {
                            fields: {
                                source: {
                                    type: "select",
                                    label: lang.sourceLabel,
                                    optionLabels: [lang.csObjLabel, lang.evtPropLabel, lang.prevActLabel]
                                },
                                properties_label: {
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type: "text",
                                    dependencies: {
                                        source: ""
                                    }
                                },
                                csObj_field: {
                                    type: "otcs_node_picker",
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type_control: {
                                        parameters: {
                                            startLocations: [
                                                "csui/dialogs/node.picker/start.locations/current.location",
                                                "csui/dialogs/node.picker/start.locations/enterprise.volume",
                                                "csui/dialogs/node.picker/start.locations/personal.volume",
                                                "csui/dialogs/node.picker/start.locations/favorites",
                                                "csui/dialogs/node.picker/start.locations/recent.containers",
                                                "csui/dialogs/node.picker/start.locations/category.volume",
                                                "csui/dialogs/node.picker/start.locations/perspective.assets.volume",
                                                "recman/dialogs/node.picker/start.locations/classifications.volume"
                                            ]
                                        }
                                    },

                                    dependencies: {
                                        source: "csObj"
                                    }
                                },
                                evtProp_field: {
                                    type: "select",
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    dependencies: {
                                        source: "evtProp"
                                    }
                                },
                                prevAct_field: {
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type: "text",
                                    dependencies: {
                                        source: "prevAct"
                                    }
                                }
                            }
                        };

                        data[fieldKey] = {
                            source: source,
                            properties_label: " ",
                            csObj_field: propVal,
                            evtProp_field: propVal,
                            prevAct_field: resultsfromprev
                        };
                    }
                }
            }
            attributes.schema.properties['action'].enum = actionFieldEnum;
            attributes.options.fields['action'].optionLabels = actionFieldLabels;

            this.set(attributes);
        }

    });

    return EACActionFormModel;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/action',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.actionName : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class='eac-actions-list'>0"
    + this.escapeExpression(((helper = (helper = helpers.sequence || (depth0 != null ? depth0.sequence : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"sequence","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.actionName || (depth0 != null ? depth0.actionName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actionName","hash":{}}) : helper)))
    + "</div>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<div class='eac-action-header'>\r\n  <h5 class='eac-action-title'>"
    + this.escapeExpression(((helper = (helper = helpers.actionLabel || (depth0 != null ? depth0.actionLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actionLabel","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.sequence || (depth0 != null ? depth0.sequence : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"sequence","hash":{}}) : helper)))
    + "</h5>\r\n  <button class=\"xecmpf-eac-action-delete csui-icon eac-delete-icon\" aria-hidden=\"true\"></button>\r\n  <button class='xecmpf-eac-action-copy csui-icon eac-copy-icon' aria-hidden=\"true\"></button>\r\n</div>\r\n<div class=\"xecmpf-eac-action-form\"></div>\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(4, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_action', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/actions',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<h2 class=\"xecmpf-eac-actions-header\">"
    + this.escapeExpression(((helper = (helper = helpers.actionslabel || (depth0 != null ? depth0.actionslabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actionslabel","hash":{}}) : helper)))
    + "</h2>\r\n<div class=\"xecmpf-eac-actions-container\"></div>\r\n\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "\r\n<div class=\"csui-perfect-scrolling xecmpf-eac-actions-form\">\r\n    <div class=\"xecmpf-eac-actions-container\"></div>\r\n    <div class=\"xecmpf-eac-actions-new-add\">\r\n      <span class=\"carousel-nav-dash\"></span>\r\n      <span class=\"csui-icon eac-add-icon\" aria-hidden=\"true\"></span>\r\n      <span class=\"carousel-nav-dash\"></span>\r\n    </div>\r\n</div>\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_actions', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/actionplan/add/actions.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette', 'csui/utils/contexts/factories/connector', 'csui/controls/form/form.view',
    'xecmpf/widgets/eac/impl/actionplan/add/action.form.model', 'csui/controls/progressblocker/blocker',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/controls/globalmessage/globalmessage',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/action',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/actions',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
],
        function (_, $, Backbone, Marionette, ConnectorFactory, FormView,
                EACActionFormModel, BlockingView, PerfectScrollingBehavior, GlobalMessage,
                actionTemplate, actionsTemplate, lang) {

            var EACActionView = Marionette.LayoutView.extend({

                className: 'xecm-eac-action',

                template: actionTemplate,

                templateHelpers: function () {
                    var lastIndex, actionName, action_name;
                    if (this.model.attributes.formModel.attributes.data.action) {
                        lastIndex = this.model.attributes.formModel.attributes.data.action.lastIndexOf(".");
                        actionName = this.model.attributes.formModel.attributes.data.action.slice(lastIndex + 1);
                        action_name = actionName;
                    }

                    return {
                        summary: this.options.summary,
                        actionName: action_name,
                        actionLabel: lang.actionLabel
                    };
                },

                initialize: function () {
                    if (!this.options.summary) {
                        this.formView = new FormView({
                            context: this.options.context,
                            layoutMode: 'singleCol',
                            mode: 'create',
                            model: this.model.get('formModel')
                        });
                        BlockingView.imbue(this.formView);
                    }
                },

                regions: {
                    actionForm: '.xecmpf-eac-action-form'
                },

                events: {
                    'click .xecmpf-eac-action-delete': '_deleteAction',
                    'click .xecmpf-eac-action-copy': '_copyAction',
                },

                _deleteAction: function () {
                    if (this._parent.collection.length > 1) {
                        var parentObj = this._parent;
                        this.model.destroy();
                        parentObj.collection.forEach(function (model, index) {
                            model.set('sequence', ++index);
                        });
                        parentObj.render();
                    } else {
                        GlobalMessage.showMessage('warning', lang.warningMsgondeletionOfLast1Action);
                    }
                },

                _copyAction: function () {
                    var formModelAttrs = _.deepClone(this.model.get('formModel').attributes);
                    var model = new Backbone.Model({
                        sequence: this.model.collection.length + 1,
                        formModel: new EACActionFormModel(formModelAttrs, {
                            context: this.options.context,
                            eventModel: this.options.eventModel
                        })
                    });
                    this.model.collection.add(model);
                },

                onRender: function () {
                    if (this.formView) {
                        this.showChildView('actionForm', this.formView);
                        this.formView.blockActions();
                        var that = this;
                        this.listenTo(this.formView, 'render', function () {
                            that.formView.unblockActions();
                        });
                    }
                },

                getSubmitData: function () {
                    return this.formView.getValues();
                }
            });

            var EACActionsView = Marionette.CompositeView.extend({

                className: 'xecmpf-eac-actions',

                template: actionsTemplate,

                templateHelpers: function () {
                    return {
                        summary: this.options.summary,
                        actionslabel: lang.addActionSummaryPageActionPlanLabel
                    };
                },

                regions: {
                    actionsRegion: ".xecmpf-eac-actions-container"
                },

                behaviors: {
                    PerfectScrolling: {
                        behaviorClass: PerfectScrollingBehavior,
                        contentParent: '.xecmpf-eac-actions-form',
                        suppressScrollX: true,
                        scrollXMarginOffset: 15
                    }
                },

                initialize: function (options) {
                    if (!options.collection) {
                        this.collection = new Backbone.Collection();
                        var model;
                        if (options.eventModel.fromEdit) {
                            var actions = this.options.eventModel.get('actions'), i;
                            for (i = 0; i < actions.length; i++) {
                                model = new Backbone.Model({
                                    sequence: i + 1,
                                    formModel: new EACActionFormModel(undefined, {
                                        context: this.options.context,
                                        eventModel: this.options.eventModel,
                                        actions: actions[i]
                                    })
                                });
                                this.collection.add(model);
                            }
                        } else {
                            model = new Backbone.Model({
                                sequence: 1,
                                formModel: new EACActionFormModel(undefined, {
                                    context: this.options.context,
                                    eventModel: this.options.eventModel
                                })
                            });
                            this.collection.add(model);
                        }

                    }
                },

                events: {
                    'click .xecmpf-eac-actions-new-add': 'addNewAction'
                },

                addNewAction: function () {
                    var isValid = true;
                    _.map(this.children._views, function (childView) {
                        if (!childView.formView.validate()) {
                            isValid = false;
                        }
                    });
                    if (isValid) {
                        var model = new Backbone.Model({
                            sequence: this.collection.length + 1,
                            formModel: new EACActionFormModel(undefined, {
                                context: this.options.context,
                                eventModel: this.options.eventModel
                            })
                        });
                        this.collection.add(model);
                    }
                },

                childViewContainer: '.xecmpf-eac-actions-container',

                childView: EACActionView,

                childViewOptions: function () {
                    return {
                        context: this.options.context,
                        eventModel: this.options.eventModel,
                        summary: this.options.summary
                    };
                },

                getSummaryData: function () {
                    return this.collection;
                },

                getSubmitData: function () {
                    return _.map(this.children._views, function (childView) {
                        return childView.getSubmitData();
                    });
                }
            });

            return EACActionsView;
        });


csui.define('xecmpf/widgets/eac/impl/actionplan/add/summary.form.model',['csui/models/form', 'i18n!xecmpf/widgets/eac/impl/nls/lang'], function (FormModel, lang
) {

    var EACSummaryFormModel = FormModel.extend({
        constructor: function EACSummaryFormModel(attributes, options) {
            this.options = options || (options = {});
            attributes || (attributes = {
                schema: { properties: {} },
                options: { fields: {} },
                date: {}
            });
            FormModel.prototype.constructor.call(this, attributes, options);
        },

        initialize: function (attributes, options) {
            this._setAttributes();
        },

        _setAttributes: function () {
            var that = this;
            var run_as = '';
            var process_mode = '';
            if(this.options.eventModel && this.options.eventModel.attributes && this.options.eventModel.attributes.process_mode){
                process_mode = this.options.eventModel.attributes.process_mode
            }
            if(this.options.eventModel && this.options.eventModel.attributes && this.options.eventModel.attributes.run_as_key){
                run_as = this.options.eventModel.attributes.run_as_key
            }
            
            this.set({
                schema: {
                    properties: {
                        run_as: {
                            required: true,
                            type: "otcs_user_picker"
                        },
                        process_mode: {
                            enum: ['Synchronously'],
                            required: true,
                            type: "string"
                        }
                    }
                },
                options: {
                    fields: {
                        run_as: {
                            label: lang.runAs,
                            type: "otcs_user_picker",
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        },
                        process_mode: {
                            label: lang.processMode,
                            type: "select",
                            optionLabels: [lang.synchronouslyProcessLabel],
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        }
                    }
                },
                data: {
                    run_as: run_as,
                    process_mode: process_mode
                }
            });
        }

    });
    return EACSummaryFormModel;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/summary',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class='csui-perfect-scrolling xecmpf-eac-summary-view'>\r\n    <div class=\"xecmpf-eac-summary-bo-form\">\r\n        <span class=\"xecmpf-eac-summary-bussapp\">"
    + this.escapeExpression(((helper = (helper = helpers.bussapp || (depth0 != null ? depth0.bussapp : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"bussapp","hash":{}}) : helper)))
    + "</span>\r\n        <span class=\"xecmpf-eac-summary-namespace\">"
    + this.escapeExpression(((helper = (helper = helpers.namespace || (depth0 != null ? depth0.namespace : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"namespace","hash":{}}) : helper)))
    + "</span>\r\n    </div>\r\n    <div class=\"xecmpf-eac-summary-rules\"></div>\r\n    <div class=\"xecmpf-eac-summary-actions\"></div>\r\n    <div class=\"xecmpf-eac-summary-form\"></div>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_summary', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/actionplan/add/summary.view',['csui/lib/backbone', 'csui/lib/marionette',
    'csui/controls/form/form.view',
    'xecmpf/widgets/eac/impl/actionplan/add/summary.form.model',
    'xecmpf/widgets/eac/impl/actionplan/add/rules.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actions.view',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/summary',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (Backbone, Marionette,
        FormView, SummaryFormModel, RulesView, ActionsView, EACEmptyRulesItemView, PerfectScrollingBehavior, template, lang) {

    var EACSummaryView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-summary',

        template: template,

        templateHelpers: function () {
            return {
                bussapp: lang.bussapplicatoin,
                namespace: this.options.eventModel.get ? this.options.eventModel.get('namespace') : this.options.eventModel.attributes.namespace
            };
        },

        regions: {
            rules: '.xecmpf-eac-summary-rules',
            actions: '.xecmpf-eac-summary-actions',
            form: '.xecmpf-eac-summary-form'
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-summary-view',
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },

        initialize: function (options) {
        },

        onRender: function () {

            var noRules = false;
            if (this.options.data.rules.length === 1) {
                if (this.options.data.rules.models[0].attributes.formModel.get('data').from === '' ||
                        this.options.data.rules.models[0].attributes.formModel.get('data').operator === '' ||
                        this.options.data.rules.models[0].attributes.formModel.get('data').to === '') {
                    noRules = true;
                }
            } else if (this.options.data.rules.length === 0) {
                noRules = true;
            }


            this.rulesSummaryView = new RulesView({
                summary: true,
                noRules: noRules,
                collection: this.options.data.rules
            });

            this.actionsSummaryView = new ActionsView({
                summary: true,
                collection: this.options.data.actions
            });

            var model = new SummaryFormModel(undefined, {
                context: this.options.context,
                eventModel: this.options.eventModel
            });

            this.formView = new FormView({
                context: this.options.context,
                mode: 'create',
                model: model
            });

            this.showChildView('rules', this.rulesSummaryView);
            this.showChildView('actions', this.actionsSummaryView);
            this.showChildView('form', this.formView);
        },

        getSubmitData: function () {
            return this.formView.getValues();
        }

    });
    return EACSummaryView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"xecmpf-eac-actionplan-add-nav\"></div>\r\n<div class=\"xecmpf-eac-actionplan-add-content\"></div>";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_actionplan_add_actionplan.add', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add',[],function(){});
csui.define('xecmpf/widgets/eac/impl/actionplan/add/actionplan.add.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'csui/utils/contexts/factories/connector',
    'xecmpf/widgets/eac/impl/carousel.nav/carousel.nav.view',
    'xecmpf/widgets/eac/impl/actionplan/add/rules.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actions.view',
    'xecmpf/widgets/eac/impl/actionplan/add/summary.view',
    'csui/controls/globalmessage/globalmessage',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add'
], function (_, $, Marionette,
        ConnectorFactery, CarouselNavView,
        RulesView, ActionsView, SummaryView,
        GlobalMessage, PerfectScrollingBehavior,
        template,
        TabKeyBehavior,
        lang) {

    var EACActionPlanAddView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-actionplan-add',

        template: template,

        steps: [{
                key: 'rules',
                viewClass: RulesView,
                label: lang.addRuleDialogTitle,
                updateLabel: lang.editRuleHeaderLabel,
                buttons: ['eac-actionplan-add-next-btn']
            }, {
                key: 'actions',
                viewClass: ActionsView,
                label: lang.addActionPlanLabel,
                updateLabel: lang.editActionPlanLabel,
                buttons: ['eac-actionplan-add-back-btn', 'eac-actionplan-add-next-btn']
            }, {
                key: 'summary',
                viewClass: SummaryView,
                label: lang.saveActionPlanLabel,
                updateLabel: lang.updateActionPlanLabel,
                viewOptions: function () {
                    var data = this.steps.reduce(function (memo, step) {
                        if (step.view && !step.view.isDestroyed) {
                            memo[step.key] = getOption.call(step.view, 'getSummaryData', step.view);
                        }
                        return memo;
                    }, {});
                    return {
                        data: data
                    }
                },
                buttons: ['eac-actionplan-add-back-btn', 'eac-actionplan-add-finish-btn']
            }],

        initialize: function (options) {
            this.active = 0;

            this.navView = new CarouselNavView({
                count: this.steps.length,
                active: this.active
            });

            this.step = this.steps[this.active];
            options.btnOptions.activeButtons = this.step.buttons;
            options.btnOptions.genInfo = this.generalInfo(options);
        },

        behaviors: {
            TabKeyRegion: {
                behaviorClass: TabKeyBehavior
            }
        },

        generalInfo: function (options) {
            var genInfo = {};
            var localModuleObject;
            if (options.eventModel.attributes) {
                localModuleObject = options.eventModel.attributes;
            } else if (options.currentModel.attributes) {
                localModuleObject = options.currentModel.attributes;
                //options.eventModel.attributes = options.currentModel.attributes;
                options.eventModel.attributes = {
                    namespace: options.currentModel.attributes.namespace,
                    event_name: options.currentModel.attributes.event_name
                };
            }

            genInfo['event_id'] = localModuleObject.event_id;
            genInfo['namespace'] = localModuleObject.namespace;
            genInfo['event_name'] = localModuleObject.event_name;
            genInfo['rule_id'] = localModuleObject.rule_id;
            genInfo['plan_id'] = localModuleObject.plan_id;
            return genInfo;
        },

        regions: {
            nav: '.xecmpf-eac-actionplan-add-nav',
            content: '.xecmpf-eac-actionplan-add-content'
        },

        onBack: function (btnOptions, headerView) {
            // update content view
            if (this.active > 0) {
                this.step = this.steps[--this.active];
                btnOptions.activeButtons = this.step.buttons;
                this._showContentView(headerView);
                // update nav view
                this.navView.triggerMethod('back');
            }
        },

        onNext: function (btnOptions, headerView) {
            // update content view
            var isValid = true;
            if (this.active < this.steps.length - 1) {

                if (this.step.key === 'actions') {
                    _.map(this.step.view.children._views, function (childView) {
                        if (!childView.formView.validate()) {
                            isValid = false;
                        }
                    });
                }
                if (this.step.key === 'rules') {
                    _.map(this.step.view.children._views, function (childView) {
                        if (childView.formView.model.get('data').to && childView.formView.model.get('data').from && childView.formView.model.get('data').operator) {
                            isValid = true;
                        }else if(!childView.formView.model.get('data').to && !childView.formView.model.get('data').from && !childView.formView.model.get('data').operator){
							isValid = true;
						}else{
							isValid = false;
							childView.formView.validate();
						}
                    });
                }
                if (isValid) {
                    this.step = this.steps[++this.active];
                    btnOptions.activeButtons = this.step.buttons;
                    this._showContentView(headerView);
                    // update nav view
                    this.navView.triggerMethod('next');
                }
            }
        },

        onFinish: function (btnOptions, headerView) {
            var isValid = true;
            if (this.step.key === 'summary') {
                if (!this.step.view.formView.validate()) {
                    isValid = false;
                }
            }
            if (isValid) {
                var requestData = this.steps.reduce(function (memo, step) {
                    if (step.view && !step.view.isDestroyed) {
                        memo[step.key] = getOption.call(step.view, 'getSubmitData', step.view);
                        if (step.key === 'rules') {
                            if (memo[step.key][0] === undefined) {
                                memo[step.key] = undefined;
                            }
                        }
                    }
                    return memo;
                }, {});

                requestData['gen_information'] = btnOptions.genInfo;

                var actionPlanRequest = new FormData();
                var requestDataString = JSON.stringify(requestData);
                actionPlanRequest.append('action_plan_items', requestDataString);

                var connector = this.options.context.getObject(ConnectorFactery);
                var postURL = connector.connection.url.replace('/v1', '/v2') + '/eventactioncenter/actionplan';
                var that = this;

                $.ajax(connector.extendAjaxOptions({
                    type: "PUT",
                    url: postURL,
                    data: actionPlanRequest,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        // Unblock the layout view on success
                        that.trigger("sync");
                        if (response.results.statusCode === 200 && response.results.ok) {
                            that.trigger("refreshEACListPage");
                            var errorPopup = GlobalMessage.showMessage("success", response.results.msg);
                            setTimeout(function () {
                                errorPopup.doClose();
                            }, 3000);
                        }
                    },
                    error: function (xhr, status, error) {
                        // Unblock the layout view on error
                        that.trigger("error");
                        that.trigger("refreshEACListPage");
                        var errorMessage = xhr.responseJSON ?
                                (xhr.responseJSON.errorDetail ? xhr.responseJSON.errorDetail :
                                        xhr.responseJSON.error) :
                                "Server Error: Unable to perform the action";
                        var errorPopup = GlobalMessage.showMessage("error", errorMessage);
                        setTimeout(function () {
                            errorPopup.doClose();
                        }, 3000);
                    }
                }));
            }
        },

        _showContentView: function (headerView) {
            if (!this.step.view || this.step.view.isDestroyed) {
                this.step.view = new this.step.viewClass(_.extend({
                    context: this.options.context,
                    eventModel: this.options.eventModel,
                    headerView: headerView
                }, getOption.call(this, 'viewOptions', this.step)));
            }
            this.showChildView('content', this.step.view, {preventDestroy: true});
            if (headerView && headerView.options && headerView.options.headers) {
                if (headerView.options.fromEdit) {
                    headerView.options.headers[0] = {label: this.step.updateLabel, class: "eac-dialog-header"};
                } else {
                    headerView.options.headers[0] = {label: this.step.label, class: "eac-dialog-header"};
                }
                headerView.render();
            }

        },

        onRender: function () {
            this.showChildView('nav', this.navView);
            this._showContentView();            
        },
        
        onAfterShow: function () {
            this.step.view.triggerMethod('dom:refresh');
        },

        onBeforeDestroy: function () {
            this.navView.destroy();
            this.steps.forEach(function (step) {
                step.view && step.view.destroy();
            });
        }
    });

    function getOption(property, source) {
        var value = source[property];
        return _.isFunction(value) ? value.call(this) : value;
    }

    return EACActionPlanAddView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.header.view',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "        <button class=\"csui-icon xecmpf-eac-popover-back-icon\" aria-hidden=\"true\" id=\"xecmpf-eac-popover-back\"></button>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "        <button class=\"csui-icon xecmpf-eac-popover-next-icon\" aria-hidden=\"true\" id=\"xecmpf-eac-popover-next\"></button>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "\r\n    <div class=\"xecmpf-eac-popover-backbutton\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.enableBackButton : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "    </div>\r\n\r\n<div class=\"eac-header\">\r\n    <span class=\"xecmpf-eac-popover-headerName\">"
    + this.escapeExpression(((helper = (helper = helpers.headerTypeName || (depth0 != null ? depth0.headerTypeName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"headerTypeName","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"index","hash":{}}) : helper)))
    + "</span>\r\n    <span class=\"xecmpf-eac-popover-plan\">"
    + this.escapeExpression(((helper = (helper = helpers.planName || (depth0 != null ? depth0.planName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"planName","hash":{}}) : helper)))
    + "</span>\r\n</div>\r\n\r\n    <div class=\"xecmpf-eac-popover-nextbutton\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.enableNextButton : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "    </div>\r\n\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_previewpane_impl_previewpane.header.view', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.header.view',[
    'csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.header.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Backbone, Marionette, ViewEventsPropagationMixin, template, lang) {

    var EACPopoverHeaderView = Marionette.ItemView.extend({

        className: 'xecmpf-eac-binf-popover-header-view',

        constructor: function EACPopoverHeaderView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);

            this.model = new Backbone.Model({
                headerTypeName: this.options.headerTypeName,
                planName: this.options.planName,
                enableBackButton: this.options.enableBackButton,
                enableNextButton: this.options.enableNextButton,
                index: this.options.index
            });

        },

        template: template,

        templateHelpers: function () {
            return {
                headerTypeName: this.model.get('headerTypeName'),
                planName: this.model.get('planName'),
                enableBackButton: this.model.get('enableBackButton'),
                enableNextButton: this.model.get('enableNextButton'),
                index: this.model.get('index')
                        // headerTypeName: this.options.headerTypeName || this.model.get('headerTypeName'),
                        // planName : this.options.planName || this.model.get('planName')
            };
        },

        onBeforeDestroy: function () {
            if (this._nodeIconView) {
                this._nodeIconView.destroy();
            }
        }

    });

    _.extend(EACPopoverHeaderView.prototype, ViewEventsPropagationMixin);
    return EACPopoverHeaderView;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.footer.view',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<!--<div id='xecmpf-eac-popover-footer' class='xecmpf-eac-popover-footer'>-->\r\n    <button class='xecmpf-eac-popover-footer-class'>"
    + this.escapeExpression(((helper = (helper = helpers.edit || (depth0 != null ? depth0.edit : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"edit","hash":{}}) : helper)))
    + "</button>\r\n<!--</div>-->";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_previewpane_impl_previewpane.footer.view', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.footer.view',[
    'csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.footer.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Backbone, Marionette, ViewEventsPropagationMixin, template, lang) {

    var EACPopoverFooterView = Marionette.ItemView.extend({

        className: 'xecmpf-eac-binf-popover-footer-view',

        events: {
            'click #xecmpf-eac-popover-footer': 'openEditDialogue'
        },

        constructor: function EACPopoverHeaderView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);

        },

        template: template,

        templateHelpers: function () {
            return {
                edit: this.options.editButtonName ||lang.editButtonLabel
            };
        },

        onBeforeDestroy: function () {
            if (this._nodeIconView) {
                this._nodeIconView.destroy();
            }
        }

    });

    _.extend(EACPopoverFooterView.prototype, ViewEventsPropagationMixin);
    return EACPopoverFooterView;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.list.item',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div class=\"xecmpf-eac-rules\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.noRules : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0)})) != null ? stack1 : "")
    + "        \r\n    </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "            <span class=\"xecmpf-eac-rules-empty\">"
    + this.escapeExpression(((helper = (helper = helpers.emptyRules || (depth0 != null ? depth0.emptyRules : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"emptyRules","hash":{}}) : helper)))
    + "</span>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "            <span class=\"xecmpf-eac-rules-key\">"
    + this.escapeExpression(((helper = (helper = helpers.operand || (depth0 != null ? depth0.operand : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"operand","hash":{}}) : helper)))
    + "</span>\r\n            <span class=\"xecmpf-eac-rules-operator\">"
    + this.escapeExpression(((helper = (helper = helpers.operator || (depth0 != null ? depth0.operator : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"operator","hash":{}}) : helper)))
    + "</span> &nbsp;&nbsp;\r\n            <span class=\"xecmpf-eac-rules-value\">"
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{}}) : helper)))
    + "</span>\r\n            <!--<span class=\"xecmpf-eac-rules-conjection\">"
    + this.escapeExpression(((helper = (helper = helpers.conjunction || (depth0 != null ? depth0.conjunction : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"conjunction","hash":{}}) : helper)))
    + "</span>-->\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "    <div class=\"xecmpf-eac-actions\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.actionscount : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "        \r\n        <span class=\"xecmpf-eac-actions-name\">0"
    + this.escapeExpression(((helper = (helper = helpers.position || (depth0 != null ? depth0.position : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"position","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.action_name || (depth0 != null ? depth0.action_name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"action_name","hash":{}}) : helper)))
    + "</span>\r\n    </div>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actionscount : depth0),{"name":"each","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"8":function(depth0,helpers,partials,data) {
    return "                <span class=\"xecmpf-eac-actions-id\">"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</span>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var helper;

  return "    <div class=\"xecmpf-eac-actplan-run\">\r\n        <span class=\"xecmpf-eac-actplan-runas\">"
    + this.escapeExpression(((helper = (helper = helpers.runAsHeader || (depth0 != null ? depth0.runAsHeader : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"runAsHeader","hash":{}}) : helper)))
    + "</span>\r\n        <span class=\"xecmpf-eac-actplan-user\">"
    + this.escapeExpression(((helper = (helper = helpers.runAsUser || (depth0 != null ? depth0.runAsUser : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"runAsUser","hash":{}}) : helper)))
    + "</span>\r\n    </div>\r\n    <div class=\"xecmpf-eac-actplan-process\">\r\n        <span class=\"xecmpf-eac-actplan-mode\">"
    + this.escapeExpression(((helper = (helper = helpers.processHeader || (depth0 != null ? depth0.processHeader : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"processHeader","hash":{}}) : helper)))
    + "</span>\r\n        <span class=\"xecmpf-eac-actplan-value\">"
    + this.escapeExpression(((helper = (helper = helpers.processMode || (depth0 != null ? depth0.processMode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"processMode","hash":{}}) : helper)))
    + "</span>\r\n    </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isRulesView : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isActionPlanView : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isactPlanRunView : depth0),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_previewpane_impl_previewpane.list.item', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.list.item.view',[
    'csui/lib/marionette',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.list.item',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (Marionette, template, lang) {
    var EACListItemView = Marionette.ItemView.extend({
//className: 'csui-favorite-groups-rows',
        tagName: 'div',
        template: template,
        templateHelpers: function () {
            var that = this;
            return {
                isRulesView: that.options.rulesView,
                isActionPlanView: that.options.actionsView,
                runAsHeader: that.options.runAsHeader,
                runAsUser: that.options.runAsUser,
                processHeader: that.options.processHeader,
                processMode: that.options.processMode,
                isactPlanRunView: that.options.isactPlanRunView,
                noRules: that.options.noRules ? that.options.noRules : false,
                emptyRules: lang.noRulesDefined,
                action_name: this.options.model.get('action_name')
            };
        },
        constructor: function EACListItemView(options) {
            options || (options = {});
            this.options = options;
            if(this.options.actionsView){
                var lastIndex = this.options.model.get('action_key').lastIndexOf(".");
                var actionName = this.options.model.get('action_key').slice(lastIndex+1);
                this.options.model.attributes.action_name = actionName;
            }
            Marionette.ItemView.prototype.constructor.call(this, options);
        }


    });
    return EACListItemView;
});
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.list.view',[
    'csui/lib/backbone',
    'csui/lib/marionette',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.list.item.view'
], function (Backbone, Marionette, EACEmptyRulesItemView, EACListItemView) {
    var EACListView = Marionette.CollectionView.extend({

        emptyView: EACEmptyRulesItemView,

        emptyViewOptions: function () {
            return this.options;
        },

        childView: EACListItemView,

        childViewOptions: function () {
            return this.options;
        },

        constructor: function EACListView(options) {
            options || (options = {});
            this.options = options;
            if (this.options.rulesView) {
                if (this.options.collection.length === 0) {
//                    if (this.options.collection.models[0].get('operand') === '' &&
//                            this.options.collection.models[0].get('operator') === '' &&
//                            this.options.collection.models[0].get('value') === '' &&
//                            this.options.collection.models[0].get('conjunction') === '') {
//                        this.options.noRules = true;
//                    }
                    this.options.noRules = true;
                }
            }
            if (!this.options.collection) {
                this.options.collection = new Backbone.Collection({
                    runAsHeader: this.options.runAsHeader,
                    runAsUser: this.options.runAsUser,
                    processHeader: this.options.processHeader,
                    processMode: this.options.processMode,
                    isactPlanRunView: this.options.actPlanRunView
                });
            }

            Marionette.CollectionView.prototype.constructor.call(this, options);
        }

    });

    return EACListView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.layout.view',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"xecmpf-eac-popover-header\"></div>\r\n<div class=\"xecmpf-eac-navigation-controller\"></div>\r\n<div class=\"csui-perfect-scrolling xecmpf-eac-popover-content-all\">\r\n    <div class=\"xecmpf-eac-rules-header\">"
    + this.escapeExpression(((helper = (helper = helpers.rule || (depth0 != null ? depth0.rule : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"rule","hash":{}}) : helper)))
    + "</div>    \r\n    <div class=\"xecmpf-eac-rules-region\"></div>\r\n\r\n    <div class=\"xecmpf-eac-actionplan-header\">"
    + this.escapeExpression(((helper = (helper = helpers.actionPlanLabel || (depth0 != null ? depth0.actionPlanLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actionPlanLabel","hash":{}}) : helper)))
    + "</div>\r\n    <div class=\"xecmpf-eac-action-region\"></div>\r\n\r\n    <div class=\"xecmpf-eac-popover-runas\">\r\n    </div>\r\n</div>\r\n<div class=\"xecmpf-eac-popover-footer\"></div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_previewpane_impl_previewpane.layout.view', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.layout.view',['csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/url',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/utils/contexts/factories/connector',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.header.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.footer.view',
    'xecmpf/widgets/eac/impl/carousel.nav/carousel.nav.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.list.view',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.layout.view',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (_, $, Backbone, Marionette, Url, PerfectScrollingBehavior, ConnectorFactory, EACPopoverHeaderView, EACPopoverFooterView, CarouselView, EACListView, template, TabKeyBehavior, lang) {

    var EACPopoverLayoutView = Marionette.LayoutView.extend({
        className: 'xecmpf-eac-binf-popover-layout-view',
        template: template,

        events: {
            'click #xecmpf-eac-popover-back': 'navigateToPreviousView',
            'click #xecmpf-eac-popover-next': 'navigateToNextView',
            'click .xecmpf-eac-popover-footer': 'openEditAllActionPlan'
        },

        regions: {
            headerRegion: ".xecmpf-eac-popover-header",
            rulesRegion: ".xecmpf-eac-rules-region",
            actionRegion: ".xecmpf-eac-action-region",
            runasRegion: ".xecmpf-eac-popover-runas",
            footerRegion: ".xecmpf-eac-popover-footer",
            navigationRegion: ".xecmpf-eac-navigation-controller"
        },

        constructor: function EACPopoverLayoutView(options) {
            options || (options = {});
            Marionette.LayoutView.prototype.constructor.apply(this, arguments);
            this.currIndex = 0;
//            this.model = this.options.model;
//            this.namespace = this.options.model.get('namespace');
//            this.eventname = this.options.model.get('event_name');
//            this.eventid = this.options.model.get('event_id');
            this.actionplan = this.options.model.get('action_plans');
            this.actionplan.eventname = this.options.model.get('event_name');
            this.actionplan.namespace = this.options.model.get('namespace');
            this.actionplan.eventid = this.options.model.get('event_id');
            this.actionplan.systemname = this.options.model.get('business_application');

            this.updateLayoutView(this.currIndex, false);
        },

        templateHelpers: function () {
            return {
                rule: lang.rulesLabel,
                actionPlanLabel: lang.columnActionPlan
            };
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-popover-content-all',
                //contentParent: this.$el,
                suppressScrollX: true,
                scrollYMarginOffset: 15
            },
            TabKeyRegion: {
                behaviorClass: TabKeyBehavior
              }
        },

        updateLayoutView: function (currIndex, isShowRegion) {
            this.headerView(currIndex, isShowRegion);
            this.contentView(currIndex, isShowRegion);
            this.navCouroselView(currIndex, isShowRegion);
            this.footerView(isShowRegion);
        },

        navigateToNextView: function () {
            this.updateLayoutView(this.currIndex + 1, true);
            this.currIndex = this.currIndex + 1;
        },

        navigateToPreviousView: function () {
            this.updateLayoutView(this.currIndex - 1, true);
            this.currIndex = this.currIndex - 1;
        },

        openEditAllActionPlan: function (event) {
            event.currIndex = this.currIndex;
            this.trigger("PopoverLayoutEidtAll", event);
        },

        headerView: function (currIndex, isShowRegion) {
            if (this.headerRegionViewObject && isShowRegion) {
                this.headerRegionViewObject.destroy();
            }
            currIndex = currIndex + 1;
            var enableBackButton = false;
            var enableNextButton = false;
            var actionPlanCount = this.model.attributes.action_plans.length;
            if (currIndex === actionPlanCount) {
                if (actionPlanCount === 1) {
                    enableBackButton = false;
                } else {
                    enableBackButton = true;
                }
                enableNextButton = false;
            } else if (currIndex === 1) {
                enableBackButton = false;
                enableNextButton = true;
            } else {
                enableBackButton = true;
                enableNextButton = true;
            }
            this.headerRegionViewObject = new EACPopoverHeaderView({
                headerTypeName: lang.actionPlan,
                planName: this.actionplan.eventname,
                index: currIndex,
                enableBackButton: enableBackButton,
                enableNextButton: enableNextButton
            });

            if (isShowRegion) {
                this.headerRegion.show(this.headerRegionViewObject);
            }

        },

        contentView: function (currIndex, isShowRegion) {
            if (this.rulesView && this.actionsView && this.actPlanRunasView && isShowRegion) {
                this.rulesView.destroy();
                this.actionsView.destroy();
                this.actPlanRunasView.destroy();
            }
            var actionPlans = this.actionplan;
            var rules = actionPlans[currIndex]["rules"];
            var actionPlan = actionPlans[currIndex]["actions"];

            this.rulesView = new EACListView({
                collection: new Backbone.Collection(rules),
                rulesView: true
            });

            this.actionsView = new EACListView({
                collection: new Backbone.Collection(actionPlan),
                actionsView: true
            });

            this.actPlanRunasView = new EACListView({
                runAsHeader: lang.runAs,
                runAsUser: actionPlans[currIndex]['run_as_value'],
                processHeader: lang.processMode,
                processMode: actionPlans[currIndex]['process_mode'],
                isactPlanRunView: true
            });

            if (isShowRegion) {
                this.rulesRegion.show(this.rulesView);
                this.actionRegion.show(this.actionsView);
                this.runasRegion.show(this.actPlanRunasView);
            }
        },

        footerView: function (isShowRegion) {
            if (this.footerRegionViewObject && isShowRegion) {
                this.footerRegionViewObject.destroy();
            }
            this.footerRegionViewObject = new EACPopoverFooterView({
                enableButton: true,
                editButtonName: lang.editAllButtonLabel
            });

            if (isShowRegion) {
                this.footerRegion.show(this.footerRegionViewObject);
            }

        },

        navCouroselView: function (currIndex, isShowRegion) {
            if (this.navigationViewObject && isShowRegion) {
                this.navigationViewObject.destroy();
            }
            var total = this.model.attributes.action_plans.length;
            var current = currIndex;
            //var dashes = true;

            if (total > 1) {
                this.navigationViewObject = new CarouselView({
                    count: total,
                    active: current
                });
            }

            if (isShowRegion) {
                this.navigationRegion.show(this.navigationViewObject);
            }
        },

        _onDomRefresh: function () {
            if (this.$el.is(':visible')) {
                if (this.runasRegion || this.rulesRegion || this.actionRegion) {
                    this.rulesRegion.triggerMethod('dom:refresh', this.rulesRegion);
                    this.actionRegion.triggerMethod('dom:refresh', this.actionRegion);
                    this.runasRegion.triggerMethod('dom:refresh', this.runasRegion);
                }
            }
        },

        onRender: function () {
            this.headerRegion.show(this.headerRegionViewObject);
            this.footerRegion.show(this.footerRegionViewObject);
            if (this.navigationViewObject) {
                this.navigationRegion.show(this.navigationViewObject);
            }
            this.runasRegion.show(this.actPlanRunasView);
            this.rulesRegion.show(this.rulesView);
            this.actionRegion.show(this.actionsView);
        }
    });

    return EACPopoverLayoutView;
});        

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"binf-panel-body xecmpf-eac-preview-body\"></div>";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_previewpane_impl_previewpane', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/previewpane/previewpane.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.layout.view',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Marionette, LayoutviewEventsPropogationMixin, PerfectScrollingBehavior, TabKeyBehavior, EACPopoverLayoutView,
    template) {

        var EACPreviewPane = Marionette.LayoutView.extend({

            class: 'xecmpf-eac-preview binf-panel binf-panel-default',
            constructor: function EACPreviewPane(options) {
                Marionette.LayoutView.prototype.constructor.apply(this, arguments);
                options || (options = {});
                this.config = options.config;
                this.currElemClassName = options.currElemClassName;
                this.previewPane = this.options.parent.$el.find('.' + this.currElemClassName);
                if (this.config) {
                    // the related item view to show the preview for
                    this.parent = options.parent;
                    this.config.readonly = true;
                    this.previewCollection = options.model;
                    this.headerTitle = options.headerTitle;
                    this.footerInfoText = options.info;
                    //---------------------------------------------------------------
                    // setup binf-popover
                    //---------------------------------------------------------------

                    this.previewPane.binf_popover({
                        content: this.$el,
                        placement: "auto left",
                        trigger: 'manual',
                        container: 'body',
                        html: true
                        // html accessiblity check: no empty headings are allowed
                        // -> use pop-over title instead of our own missing documents header
                        //title: options.headerTitle
                    });
                    //var $tip = this.parent.$el.data('binf.popover');
                    var $tip = this.previewPane.data('binf.popover');
                    var $pop = $tip.tip();
                    $pop.addClass('xecmpf-eac-previewpane-popover');
                    //setup event handlers for binf-popover and its associated item view
                    this.previewPane.unbind('click').bind('click', $.proxy(function () {
                        this.show();
                    }, this));
                    this.previewPane.unbind('keydown').bind('keydown', $.proxy(function () {
                        if(event.keyCode === 27 && this.isRendered){this.destroy();}
                    }, this));
                    // this.previewPane.unbind('mouseenter').bind('mouseenter', $.proxy(function () {
                    //     this.show();
                    // }, this));
                    // this.previewPane.unbind('mouseleave').bind('mouseleave', $.proxy(function () {
                    //     this._delayedHide();
                    // }, this));
                    $pop.unbind('click').bind('click', $.proxy(function () {
                        this.show();
                    }, this));
                    $pop.unbind('keydown').bind('keydown', $.proxy(function (event) {
						if(event.keyCode === 27){this.destroy();}
                    }, this));
                    $pop.unbind('mouseenter').bind('mouseenter', $.proxy(function () {
                        this.show();
                    }, this));
                    $pop.unbind('mouseleave').bind('mouseleave', $.proxy(function () {
                        if(!this.isDestroyed){this.destroy();}
                    }, this));
                    this.propagateEventsToRegions();
                    this.listenTo(this, 'dom:refresh', function () {
                        this.previewPane.binf_popover('show');
                    });
                }
            },
            template: template,

            regions: {
                contentRegion: '.xecmpf-eac-preview-body',
                footRegion: '.xecmpf-eac-preview-footer'
            },

            behaviors: {
                TabKeyRegion: {
                  behaviorClass: TabKeyBehavior
                }
              },

            onBeforeDestroy: function () {
                //if (this.config) {
                this.previewPane.binf_popover('destroy');
                //}
            },
            show: function () {
                //var that = this;

                //clear TimeOut if any
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }

                //nothing to do if already visible
                if (this.$el.is(":visible")) {
                    return;
                }

                this.showCancelled = false;
                this.$el.hide();
                this.render();
                if (this.eacPopoverLayoutView) {
                    this.eacPopoverLayoutView.destroy();
                }

                this.eacPopoverLayoutView = new EACPopoverLayoutView({
                    parent: this,
                    model: this.previewCollection
                });
                this.listenTo(this.eacPopoverLayoutView, 'PopoverLayoutEidtAll', function (event) {
                    this.trigger("PopoverLayoutEidtAll", event);
                });
                if (!this.showCancelled) {
                    this.contentRegion.show(this.eacPopoverLayoutView, { render: true });
                    this.$el.show();
                    this.triggerMethod('before:show', this);
                    this.toggle = 1;
                    this.previewPane.binf_popover('show');
                    this.triggerMethod('show', this);
                }
            },
            hide: function () {
                //if (this.config && !this.config.debugNoHide) {
                this.toggle = 0;
                this.previewPane.binf_popover('hide');
                this.hideTimeout = null;
                //}
                this.showCancelled = true;
                this.hideTimeout = null;
            },
            _delayedHide: function () {
                this.hideTimeout = window.setTimeout($.proxy(this.hide, this), 200);
            }

            /*onShow: function () {
             /**
             * to make the PerfectScrollingBehavior works for the simplelist.view,
             * the height needs to be set
             */
            //this.$('.cs-simplelist.binf-panel').css('height', this.$('.binf-panel-body.xecmpf-preview-body').height());

            //}*/

        });

        _.extend(EACPreviewPane.prototype, LayoutviewEventsPropogationMixin);

        return EACPreviewPane;

    });

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/editall/impl/edit.actionplans.view',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n<span class='eac-edit-actionpaln-label'>"
    + this.escapeExpression(((helper = (helper = helpers.actplanLabel || (depth0 != null ? depth0.actplanLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actplanLabel","hash":{}}) : helper)))
    + " 0"
    + this.escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"index","hash":{}}) : helper)))
    + "</span>\r\n<span class='eac-edit-eventname'>"
    + this.escapeExpression(((helper = (helper = helpers.eventname || (depth0 != null ? depth0.eventname : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"eventname","hash":{}}) : helper)))
    + "</span>\r\n<button class='csui-icon eac-delete-icon'></button>\r\n<button class='csui-icon eac-edit-icon'></button>\r\n<hr />\r\n\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_editall_impl_edit.actionplans.view', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/impl/editall/edit.actionplans.view',['csui/lib/underscore', 'csui/lib/backbone',
    'csui/lib/jquery', 'csui/lib/marionette', 'csui/utils/url',
    'csui/utils/contexts/factories/connector',
    'csui/utils/contexts/factories/node',
    'csui/controls/globalmessage/globalmessage',
    'csui/dialogs/modal.alert/modal.alert',
    'xecmpf/models/eac/eventactionplans.model',
    //'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/editall/impl/edit.actionplans.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, Backbone, $, Marionette, Url, ConnectorFactory, NodeFactory, GlobalMessage, ModalAlert, EACEventActionPlans, template, lang) {

    var EACEditActionPlanView = Marionette.ItemView.extend({
        className: 'eac-edit-actions',
        template: template,
        templateHelpers: function () {
            return{
                actplanLabel: lang.action,
                index: this._index + 1
            };
        },

        events: {
            'click .eac-delete-icon': 'deleteActionPlan',
            'click .eac-edit-icon': 'editActionPlan'
        },

        constructor: function EACEditActionPlanView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);
            if (this.options.collection) {
                this.actionplancount = this.options.collection.models.length;
                this.models = this.options.collection.models;
            }
        },

        deleteActionPlan: function (event) {
            var that = this;
            ModalAlert
                    .confirmInformation(lang.confirmDeleteMsg)
                    .done(function () {
                        event.stopPropagation();
                        event.preventDefault();
                        event.selectedModel = that.model;
                        var connector = that.options.context.getObject(ConnectorFactory, that.options);
                        var deleteActplanURL = connector.connection.url.replace('/v1', '/v2');
                        deleteActplanURL = Url.combine(deleteActplanURL, 'eventactioncenter', 'actionplan');
                        deleteActplanURL = deleteActplanURL +'?rule_id='+event.selectedModel.attributes.rule_id+'&plan_id='+event.selectedModel.attributes.plan_id;

                        that.trigger('request');
                        $.ajax(connector.extendAjaxOptions({
                            type: "DELETE",
                            url: deleteActplanURL,
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                GlobalMessage.showMessage("success", response.results.msg);
                                var parentObj = that._parent;
                                var node;
                                that.model.destroy();
                                if (parentObj.collection.length === 0) {
                                    parentObj._parentLayoutView().destroy();
                                } else {
                                    parentObj.render();
                                }
                                if (that.options.parentView) {
                                    node = that.options.parentView.options.context.getModel(NodeFactory, that.options.parentView.options);
                                    that.options.parentView.options.collection = new EACEventActionPlans([], _.extend({
                                        connector: node.connector,
                                        node: node
                                    }));
                                    that.options.parentView.options.collection.fetch();
                                    that.listenTo(that.options.parentView.options.collection, 'sync', function () {
                                        that.options.tableView.collection = that.options.parentView.options.collection;
                                        that.options.tableView.triggerMethod('dom:refresh');
                                        that.options.parentView._removeAll();
                                    });
                                }
                            },
                            error: function (xhr) {
                                // Unblock the layout view on error
                                that.trigger("error");
                                var errorMessage = xhr.responseJSON ?
                                        (xhr.responseJSON.errorDetail ? xhr.responseJSON.errorDetail :
                                                xhr.responseJSON.error) :
                                        "Server Error: Unable to perform the action";
                                GlobalMessage.showMessage("error", errorMessage);
                            }
                        }));
                    });
        },

        editActionPlan: function (event) {
            event.stopPropagation();
            event.preventDefault();
            event.selectedModel = this.model;
            event.selectedModel.attributes.namespace = this.options.namespace;
            event.selectedModel.attributes.event_name = this.options.eventname;
            event.selectedModel.attributes.system_name = this.model.get('systemname');
            event.selectedModel.fromEdit = true;
            this._parent.trigger("openEditDialog", event);
        }
    });
    return EACEditActionPlanView;
});
csui.define('xecmpf/widgets/eac/impl/editall/edit.actionplan.list.view',[
    'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'xecmpf/widgets/eac/impl/editall/edit.actionplans.view'
], function (_, Backbone, Marionette, PerfectScrollingBehavior, EACEditActionPlanView) {
    var EACEditActionPlanList = Marionette.CollectionView.extend({
        className: 'csui-perfect-scrolling eac-edit-actionplans-view',

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: this.$el,
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },

        childView: EACEditActionPlanView,

        childViewOptions: function () {
            return this.options;
        },

        constructor: function EACEditActionPlanList(options) {
            options || (options = {});
            this.options = options;
            
            this.listenTo(this, "deleteActionPlanInEditDialog", function () {
                this.trigger("deleteActionPlanInEditDialog2");
            });

            this.listenTo(this, "openEditDialog", function (event) {
                this.trigger("openEditDialog2", event);
            });

            Marionette.CollectionView.prototype.constructor.call(this, options);
        }
    });
    return EACEditActionPlanList;
});




/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/table/cells/impl/actionplan',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <a href=\"\" class = \"action-plan-edit\"> "
    + this.escapeExpression(((helper = (helper = helpers.count || (depth0 != null ? depth0.count : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"count","hash":{}}) : helper)))
    + " "
    + this.escapeExpression(((helper = (helper = helpers.actionPlan || (depth0 != null ? depth0.actionPlan : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"actionPlan","hash":{}}) : helper)))
    + "</a>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "    <button class=\"action-plan-add\">"
    + this.escapeExpression(((helper = (helper = helpers.addActionPlan || (depth0 != null ? depth0.addActionPlan : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"addActionPlan","hash":{}}) : helper)))
    + "</button>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.count : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0)})) != null ? stack1 : "")
    + "</div>";
}});
Handlebars.registerPartial('xecmpf_controls_table_cells_impl_actionplan', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/table/cells/impl/actionplan',[],function(){});
csui.define('xecmpf/controls/table/cells/eac.actionplan.view',['csui/lib/underscore', 'csui/lib/backbone', 'csui/controls/table/cells/templated/templated.view',
    'csui/controls/table/cells/cell.registry', 'csui/utils/contexts/factories/node',
    'csui/controls/dialog/dialog.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actionplan.add.view',
    'csui/controls/dialog/impl/header.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.view',
    'xecmpf/widgets/eac/impl/editall/edit.actionplan.list.view',
    'xecmpf/models/eac/eventactionplans.model',
    'hbs!xecmpf/controls/table/cells/impl/actionplan',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/controls/table/cells/impl/actionplan'

], function (_, Backbone, TemplatedCellView,
        cellViewRegistry, NodeFactory,
        DialogView,
        EACActionPlanAddView,
        DialogHeaderView,
        EACPreviewPane,
        EACEditActionPlanList,
        EACEventActionPlans,
        template,
        lang) {

    var ActionPlanCellView = TemplatedCellView.extend({

        template: template,
        className: 'csui-nowrap',

        triggers: {
            'click .action-plan-add': 'click:ActionPlanAdd'
        },

        events: {
            'click .action-plan-edit': 'editActionPlan'
        },

        getValueData: function () {
            var node = this.model,
                    count = node.get('action_plans').length;
            return {
                count: count,
                actionPlan: lang.actionPlan,
                addActionPlan: lang.addActionPlan
            };
        },

        onClickActionPlanAdd: function () {
            this.showActionPlanAddDialog(this.model);
        },

        showActionPlanAddDialog: function (eventModel) {
            var btnOptions = {
                ok: true,
                activeButtons: []
            }, title;

            if (eventModel.fromEdit) {
                title = lang.editRuleHeaderLabel;
            } else {
                title = lang.addRuleDialogTitle;
            }

            var view = new EACActionPlanAddView({
                context: this.options.context,
                eventModel: eventModel,
                btnOptions: btnOptions,
                currentModel: this.options.model
            });


            var headers = [
                {
                    label: title,
                    class: 'eac-dialog-header'
                },
                {
                    class: 'eac-header-divider'
                },
                {
                    label: this.options.model.get("event_name"),
                    class: 'eac-dialog-sub-heading'
                }];

            var options = {
                headers: headers,
                iconRight: 'cs-icon-cross',
                dialogCloseAria: 'Close dialog',
                dialogCloseButtonTooltip: 'Close',
                expandedHeader: true,
                fromEdit: eventModel.fromEdit ? eventModel.fromEdit : false
            };
            var headerView = new DialogHeaderView(options);

            var dialog = new DialogView({
                id: 'xecmpf-eac-actionplan-add-dialog',
                className: 'xecmpf-eac-actionplan-add-dialog',
                headerView: headerView,
                largeSize: false,
                view: view,
                buttons: [{
                        id: 'eac-actionplan-add-back-btn',
                        label: lang.backButtonLabel,
                        toolTip: lang.backButtonLabel,
                        click: function () {
                            view.triggerMethod('back', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }, {
                        id: 'eac-actionplan-add-next-btn',
                        label: lang.nextButtonLabel,
                        toolTip: lang.nextButtonLabel,
                        click: function () {
                            view.triggerMethod('next', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }, {
                        id: 'eac-actionplan-add-finish-btn',
                        label: lang.finishButtonLabel,
                        toolTip: lang.finishButtonLabel,
                        click: function () {
                            view.triggerMethod('finish', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }]
            });

            this.listenTo(dialog, 'before:hide', function () {
                view.destroy();
            });
            var that = this;
            this.listenTo(view, 'refreshEACListPage', function () {
                dialog.destroy();
                that.triggerMethod('refreshEACListPage');
                if (that.options && that.options.tableView) {
                    var parentView = that.options.tableView.options.parentView;
                    var node = parentView.options.context.getModel(NodeFactory, parentView.options);
                    parentView.options.collection = new EACEventActionPlans([], _.extend({
                        connector: node.connector,
                        node: node
                    }));
                    parentView.options.collection.fetch();
                    this.listenTo(parentView.options.collection, 'sync', function () {
                        that.options.tableView.collection = parentView.options.collection;
                        that.options.tableView.triggerMethod('dom:refresh');
                        parentView._removeAll();
                    });
                }
            });

            dialog.show();

            _updateDialogButtons(dialog, btnOptions);

            function _updateDialogButtons(dialog, btnOptions) {
                if (btnOptions.ok) {
                    dialog.options.buttons.forEach(function (btn) {
                        var flag = (btnOptions.activeButtons.indexOf(btn.id) !== -1);
                        dialog.updateButton(btn.id, {
                            hidden: !flag,
                            disabled: !flag
                        });
                    });
                }
            }

            if (this.editDialog) {
                this.editDialog.destroy();
            }

        },

        //edit action plan    
        editActionPlan: function (event) {

            event.preventDefault();
            event.stopPropagation();
            var that = this;
            if (that.previewpane) {
                that.previewpane.destroy();
            }

            that.previewpane = new EACPreviewPane({
                parent: that,
                currElemClassName: event.currentTarget.className,
                model: that.options.model,
                config: true
            });

            this.listenTo(that.previewpane, 'PopoverLayoutEidtAll', function (event) {
                that.PopoverLayoutEidtAll();
                that.previewpane.hide();
            });

            that.previewpane.show();

        },
        PopoverLayoutEidtAll: function () {

            var parentView, tableView;
            if (this.options && this.options.tableView) {
                parentView = this.options.tableView.options.parentView;
                tableView = this.options.tableView;
            }
            var editActionplanView = new EACEditActionPlanList({
                context: this.options.context,
                collection: new Backbone.Collection(this.options.model.attributes.action_plans),
                eventname: this.options.model.get("event_name"),
                namespace: this.options.model.get('namespace'),
                parentView: parentView,
                tableView: tableView
            });

            this.listenTo(editActionplanView, 'openEditDialog2', function (event) {
                this.openEditDialog(event);
                //this.dialog.hide();
                this.editDialog.destroy();
            });

            this.editDialog = new DialogView({
                //title: lang.editActionPlan + ' | ' + this.options.model.get("event_name"),
                className: 'eac-edit-actionplan-view',
                midSize: true,
                medSize: true,
                headers: [
                    {
                        label: lang.editActionPlan,
                        class: 'eac-edit-actionplan-label'
                    },
                    {
                        class: 'eac-edit-header-divider'
                    },
                    {
                        label: this.options.model.get("event_name"),
                        class: 'eac-eventname'
                    }],
                view: editActionplanView,
                buttons: [
                    {
                        id: 'add-new',
                        label: lang.addNew,
                        default: true,
                        disabled: false,
                        click: _.bind(this.showActionPlanAddDialog, this)
                    }
                ]
            });

            this.editDialog.show();
        },

        openEditDialog: function (event) {
            this.showActionPlanAddDialog(event.selectedModel);
        }
    },
            {
                hasFixedWidth: true,
                columnClassName: 'xecmpf-table-cell-action-plan'
            });

    cellViewRegistry.registerByColumnKey('action_plan', ActionPlanCellView);

    return ActionPlanCellView;
});
// this file is copied from //products/main/pkg/CS_CORE_UI/src/controls/dialog/impl/footer.view.js
// We use it unchanged. Please do not change it, as we want to use it from csui, when they have
// moved it from the impl directory to a public location.
csui.define('xecmpf/controls/bosearch/searchform/impl/footer.view',['csui/lib/marionette',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior'
], function ( Marionette, TabableRegion) {

  var ButtonView = Marionette.ItemView.extend({

    tagName: 'button',

    className: 'binf-btn',

    template: false,

    triggers: {
      'click': 'click'
    },

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegion
      }
    },

    constructor: function ButtonView(options) {
      Marionette.View.prototype.constructor.apply(this, arguments);
    },

    isTabable: function () {
      return this.$el.is(':not(:disabled)') && this.$el.is(':not(:hidden)');
    },
    currentlyFocusedElement: function () {
      if (this.$el.prop('tabindex') === -1){
        this.$el.prop('tabindex', 0);
      }
      return this.$el;
    },
    onRender: function () {
      var button = this.$el,
          attributes = this.model.attributes;
      button.text(attributes.label);
      button.addClass(attributes['default'] ? 'binf-btn-primary' : 'binf-btn-default');
      if (attributes.toolTip) {
        button.attr('title', attributes.toolTip);
      }
      if (attributes.separate) {
        button.addClass('cs-separate');
      }
      this.updateButton(attributes);
    },

    updateButton: function (attributes) {


      var $button = this.$el;


      attributes || (attributes = {});
      if (attributes.hidden !== undefined) {
        if (attributes.hidden) {
          $button.addClass('binf-hidden');
        } else {
          $button.removeClass('binf-hidden');
        }
      }
      if (attributes.disabled !== undefined) {
        $button.prop('disabled', attributes.disabled);
      }
    }

  });

  var DialogFooterView = Marionette.CollectionView.extend({

    childView: ButtonView,

    constructor: function DialogFooterView(options) {
      Marionette.CollectionView.prototype.constructor.apply(this, arguments);
    },
    onDomRefresh: function(){
      this.children.each(function(buttonView){
        buttonView.trigger('dom:refresh');
      });
    },

    getButtons: function() {
      return this.children.toArray();
    },

    updateButton: function (id, attributes) {
      var button = this.collection.get(id);
      if (button) {
        this.children
            .findByModel(button)
            .updateButton(attributes);
      } else {
        // If the footer comes from the dialog template including the buttons,
        // the collection of dynamically created buttons is empty.
        // The template has to provide correct initial classes for the buttons
        // and their identifiers must be present in the "data-cs-id" attribute.
        ButtonView.updateButton(this.$('[data-cs-id="' + id + '"]'), attributes);
      }
    }

  });

  return DialogFooterView;
});

csui.define('xecmpf/controls/bosearch/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/controls/bosearch/impl/nls/root/lang',{
  boSearchFormTitle: 'Search {0}',
  boSearchFormButtonSearch: 'Search',
  boSearchFormButtonCancel: 'Cancel',
  boResultListButtonAttach: 'Attach',
  noBusinessObjectsFound: 'No business objects found.',
  resultListBannerMessage: 'Search for {0}',
  resultListRefineMessage: "More results are available but result limit has been reached. Refine your search.",
  zeroSearchFields: 'No search fields configured in the business application',
  labelBusinessObjectId: 'ID',
  ERR_COLUMNS_CHANGED: 'Configuration has changed during your search. Close the search and start a new one.',
  errorGettingSearchForm: 'Error getting form for business object search.',
  errorSearchingBusinessObjects: 'Error searching for business objects.'
});



/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/bosearch/searchform/impl/bosearchform',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"conws-bosearchform-body csui-content-without-footer\">\r\n  <div class=\"conws-bosearchheader\">\r\n    <div class=\"conws-bosearchheader-title\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.search_form_title || (depth0 != null ? depth0.search_form_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"search_form_title","hash":{}}) : helper)))
    + "\">"
    + this.escapeExpression(((helper = (helper = helpers.search_form_title || (depth0 != null ? depth0.search_form_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"search_form_title","hash":{}}) : helper)))
    + "</div>\r\n    <div class=\"conws-spacer\"></div>\r\n  </div>\r\n  <div class=\"conws-bosearchfields\">\r\n  </div>\r\n  <div style=\"display:none;\" class=\"conws-bosearchfields-zero\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.zero_fields_title || (depth0 != null ? depth0.zero_fields_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"zero_fields_title","hash":{}}) : helper)))
    + "\">\r\n      \""
    + this.escapeExpression(((helper = (helper = helpers.zero_fields_title || (depth0 != null ? depth0.zero_fields_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"zero_fields_title","hash":{}}) : helper)))
    + "\"\r\n  </div>\r\n</div>\r\n<div class=\"conws-bosearchform-footer binf-modal-footer\">\r\n</div>\r\n<div class=\"conws-right-shadow\"></div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_bosearch_searchform_impl_bosearchform', t);
return t;
});
/* END_TEMPLATE */
;
/**
 * Created by stefang on 05.04.2016.
 */
csui.define('xecmpf/controls/bosearch/searchform/bosearchform.view',['require',
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/lib/backbone',
  'csui/lib/marionette',
  'csui/utils/base',
  'csui/utils/log',
  'csui/controls/form/form.view',
  'csui/utils/contexts/factories/connector',
  'csui/dialogs/modal.alert/modal.alert',
  'xecmpf/controls/bosearch/searchform/impl/footer.view',
  'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'csui/controls/tab.panel/behaviors/tab.contents.keyboard.behavior',
  'xecmpf/controls/bosearch/searchform/bosearchform.model',
  'i18n!xecmpf/controls/bosearch/impl/nls/lang',
  'hbs!xecmpf/controls/bosearch/searchform/impl/bosearchform'
], function (require, $, _, Backbone, Marionette, base, log,
    FormView,
    ConnectorFactory,
    ModalAlert,
    DialogFooterView,
    PerfectScrollingBehavior,
    LayoutViewEventsPropagationMixin,
    TabableRegionBehavior,
    TabContentKeyboardBehavior,
    BoSearchFormModel,
    lang,
    template
) {

  var BoSearchFieldsFormView = FormView.extend({

    events: {
      'keydown': 'onKeyDown'
    },

    behaviors: {
      TabableRegionBehavior: {
        behaviorClass: TabableRegionBehavior
      },
      TabContentKeyboardBehavior: {
        behaviorClass: TabContentKeyboardBehavior
      },
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        suppressScrollX: true
      }
    },

    defaults: {
      tabContentAccSelectors: 'a[href], area[href], input:not([disabled]),' +
                              ' select:not([disabled]), textarea:not([disabled]),' +
                              ' button:not([disabled]), iframe, object, embed,' +
                              ' *[tabindex], *[cstabindex], *[contenteditable]'
    },

    onKeyDown: function (event) {
      // handle tab, space, enter
      if (event.keyCode === 9 || event.keyCode === 32 || event.keyCode === 13) {
        var elem = this.onKeyInView(event);
        if (elem) {
          event.preventDefault();
          event.stopPropagation();
          // this.trigger('changed:focus', this);
          elem.prop("tabindex", "0");
          elem.focus();
        }
      }
    },

    onDomRefresh: function(){
      this.trigger("refresh:tabable:elements");
    },
    constructor: function BoSearchFieldsFormView(options) {
      _.defaults(options, this.defaults);
      options.searchTabContentForTabableElements = true;
      FormView.prototype.constructor.apply(this, arguments);
    }

  });

  var BusinessObjectSearchFormView = Marionette.LayoutView.extend({

    events: {
      'keydown': 'onKeyDown'
    },

    className: 'conws-bosearchform',
    template: template,

    triggers: {
      "click .binf-btn.search" : "bosearchform:search",
      "click .binf-btn.cancel": "bosearchform:cancel"
    },

    regions: {
      searchFields: '.conws-bosearchfields',
      footer: '.binf-modal-footer'
    },

    ui: {
      footer: '.binf-modal-footer'
    },

    constructor: function BusinessObjectSearchForm(options) {
      _.defaults(options, this.defaults);
      Marionette.LayoutView.prototype.constructor.call(this, options);
      this.propagateEventsToRegions();
      this.listenTo(this, "bosearchform:search", this._triggerSearch);
      this.listenTo(this, "bosearchform:cancel", this._triggerCancel);
      this.listenTo(this.model, "change:bo_type_name", this._updateTitle);
      this.searchFormModel = new BoSearchFormModel(
          {
            id: this.model.get("bo_type_id"),
            name: this.model.get("bo_type_name")
          },
          {connector: this.options.context.getObject(ConnectorFactory)}
      );
      this.listenTo(this.searchFormModel, "change:name", function() {
        this.model.set("bo_type_name",this.searchFormModel.get("name"));
      });
      this.listenTo(this.searchFormModel, "change", function() {
        this.model.set("bus_att_metadata_mapping",this.searchFormModel.get("bus_att_metadata_mapping"));
      });
      this.listenTo(this.searchFormModel, "error", function(model,response,options) {
        var errmsg = response && (new base.Error(response)).message || lang.errorGettingSearchForm;
        log.error("Fetching the search forms failed: {0}",errmsg) && console.error(log.last);
        ModalAlert.showError(errmsg);
      });
      // SAPRM-9295:
      // Reference Search: when search form is empty a message should be displayed
      this.listenTo(this.searchFormModel, "sync", function() {
        var data = this.searchFormModel.get("data");
        if ( $.isEmptyObject(data) ) {
          this._updateFormFieldsZero(true);

          //SAPRM-10221: focus should be in 'search' button if there are no form fields
          this.focusOnSearchButton();

        }
        else {
          this._updateFormFieldsZero(false);

          //SAPRM-10221: focus should be in first form field if there are form fields
          this.listenToOnce(this.searchForm, "render", function() {
            this.focusOnFirstFormField();
          });

        }
      });
    },

    templateHelpers: function () {
      return {
        search_form_title: this._getTitle(),
        search_button_text: lang.boSearchFormButtonSearch,
        cancel_button_text: lang.boSearchFormButtonCancel,
        zero_fields_title: lang.zeroSearchFields
      };
    },

    onKeyDown: function (event) {
      //ctrl-enter from search form field -> set focus on search button
      if (event.keyCode === 13 && event.ctrlKey) { //ctrl-enter
       // check if ctrl-enter is from a search form field, and not from search/cancel button
       if( this.searchForm.$el.has(event.originalEvent.srcElement).length > 0 ){
             this.focusOnSearchButton();
        }
      }
    },

    _getTitle: function () {
      return _.str.sformat(lang.boSearchFormTitle,this.model.get("bo_type_name"));
    },

    _updateTitle: function () {
      var titleEl = this.$el.find(".conws-bosearchheader-title"),
          title = this._getTitle();
      titleEl.text(title);
      titleEl.attr({title:title});
    },

    _updateFormFieldsZero: function (zero) {
      var elem_fields      = this.$el.find(".conws-bosearchfields");
      var elem_fields_zero = this.$el.find(".conws-bosearchfields-zero");

      if (zero) {
        elem_fields.css({"display": "none"});
        elem_fields_zero.css({"display": ""});
      }
      else {
        elem_fields.css({"display": ""});
        elem_fields_zero.css({"display": "none"});
      }
    },

    //SAPRM-10221: focus should be in 'search' button
    focusOnSearchButton: function() {
      var btnviews = this.footerView.getButtons();
      btnviews && btnviews[0] && btnviews[0].$el.focus();
    },

    //SAPRM-10221: focus should be in first form field
    focusOnFirstFormField:function() {
      var firstField = this.searchFields.$el.find('.alpaca-container-item-first input');
      if ( firstField ) {
        firstField.focus();
      }
    },

    onRender: function () {
      // LayoutView destroys views on rendering, so we must create them every time on rendering
      this.searchForm = new BoSearchFieldsFormView({model: this.searchFormModel,mode:"create",layoutMode:"singleCol"});
      this.searchForm.model.fetch();

      var buttons = [
        {
          default: true,
          label: lang.boSearchFormButtonSearch,
          click: _.bind(this._triggerSearch, this)
        },
        {
          label: lang.boSearchFormButtonCancel,
          click: _.bind(this._triggerCancel, this)
        }
      ];
      this.footerView = new DialogFooterView({
        collection: new Backbone.Collection(buttons)
      });

      this.listenTo(this.footerView, 'childview:click', this.onClickButton);

      this.searchFields.show(this.searchForm);
      this.footer.show(this.footerView);

      var btnviews = this.footerView.getButtons();
      btnviews && btnviews[0] && btnviews[0].$el.addClass("search");
      btnviews && btnviews[1] && btnviews[1].$el.addClass("cancel");

    },


    
    onClickButton: function (view) {
      var attributes = view.model.attributes;
      if (attributes.click) {
        attributes.click();
      }
    },

    _triggerSearch: function() {
      log.debug("trigger bosearch:search") && console.log(log.last);
      // get values from form and trigger search
      // var valid = this.searchForm.validate();
      // if (valid) {
      var formData = this.searchForm.getValues(),
          formSchema = {
            data: this.searchFormModel.get("data"),
            options: this.searchFormModel.get("options"),
            schema: this.searchFormModel.get("schema")
          };
      this.model.trigger("bosearch:search",{searchParams:formData,searchForms:formSchema});
      // }
    },

    _triggerCancel: function() {
      log.debug("trigger bosearch:cancel") && console.log(log.last);
      this.model.trigger("bosearch:cancel");
    }

  });

  _.extend(BusinessObjectSearchFormView.prototype, LayoutViewEventsPropagationMixin);

  return BusinessObjectSearchFormView;
});




/**
 * Created by stefang on 06.06.2016.
 */
csui.define('xecmpf/controls/bosearch/resultlist/boresult.collection',["csui/lib/jquery", "csui/lib/underscore", "csui/lib/backbone", "csui/utils/base",
  "csui/utils/log",
  "csui/models/mixins/resource/resource.mixin",
  "csui/models/browsable/browsable.mixin",
  "i18n!xecmpf/controls/bosearch/impl/nls/lang"
], function ($, _, Backbone, base, log,
    ResourceMixin, BrowsableMixin, lang) {

  function mapobj(obj,iteratee,context) {
    return _.object(_.map(_.pairs(obj),function(keyval) {
      return _.iteratee(iteratee, context)(keyval);
    }));
  }

  var BoResultTableColumnModel = Backbone.Model.extend({

    idAttribute: "key",

    defaults: {
      key: null,  // key from the resource definitions
      sequence: 0 // smaller number moves the column to the front
    },

    constructor: function BoResultTableColumnModel(attributes, options) {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    }

  });

  var BoResultTableColumnCollection = Backbone.Collection.extend({

    model: BoResultTableColumnModel,
    comparator: "sequence",

    constructor: function BoResultTableColumnCollection(models, options) {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }

  });

  var BoResultColumn = Backbone.Model.extend({

    idAttribute: "column_key",

    constructor: function BoResultColumn(attributes, options) {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    }

  });

  var BoResultColumnCollection = Backbone.Collection.extend({

    model: BoResultColumn,

    constructor: function BoResultColumnCollection(models, options) {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }

  });

  var BoResultModel = Backbone.Model.extend({
    constructor: function BoResultModel(attributes, options) {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    },
    get: function() {
      return Backbone.Model.prototype.get.apply(this, arguments);
    }
  });

  var csui_width = 120, csui_px = 14, csui_pad = 32, max_abbrev = 4;
  // csui uses 120px as average field length, including two times 8px left and right padding
  // when using a 14px font.
  // these values should be derived from the actual settings on the page. but we cannot.
  // thus we assume the standard values.

  // as csui uses an average field width that displays about 12 characters,
  // we use according maximum and minimum field lengths.
  function getLeveledLength(fieldLength,headerText,labelLength) {
    var length = Math.max(fieldLength||0,(headerText&&headerText.length)||0,labelLength||0,max_abbrev);
    length = Math.min(length,60);
    return length;
  }

  function getMinFactor(smallestLength,averageLength,longestLength) {
    // avg_width: average width per letter, for shortest text. varies: for texts of few characters
    // only, we assume abbreviations with more capital letters and we use larger value.
    var avg_width = smallestLength>max_abbrev ? 0.53 : 0.6;
    // csui_average: how many characters of the shortest text, can be placed in a average column
    var csui_average = (csui_width - csui_pad) / (csui_px * avg_width);
    // factor: set the min factor equal to the ratio of the smallest length to the average length,
    // so when scaled accordingly by the table view the smallest column has mostly no ellipsis.
    var factor = smallestLength / csui_average;
    log.debug("csui_average {0}",csui_average) && console.log(log.last)
    return Math.min(factor,0.8);
  }

  var BoResultCollection = Backbone.Collection.extend({

    model: BoResultModel,

    constructor: function BusinesObjectResultCollection(models, options) {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
      this.makeResource(options);
      this.makeBrowsable(options);
      this.boSearchModel = options.boSearchModel;
      this.searchParams = options.searchParams;
      this.labelToKey = {},
      this.nameToKey = {},
      this.columns = new BoResultColumnCollection();
      this.tableColumns = new BoResultTableColumnCollection();
      this.totalCount = 0;
      this.skipCount = 0;
      this.topCount = options.pageSize || 100;
      this.maxCount = options.maxRowCount;
      this.options = options;
    }
  },
  {
    // errors
    ERR_COLUMNS_CHANGED: "ERR_COLUMNS_CHANGED"
  });

  ResourceMixin.mixin(BoResultCollection.prototype);
  BrowsableMixin.mixin(BoResultCollection.prototype);

  var defaults = _.defaults({},BoResultCollection.prototype);

  _.extend(BoResultCollection.prototype, {

    fetch: function (options) {
      // do server call only if we have search params and
      // if either we didn't yet scroll to the end (length<maxCount)
      // or we have a reset request
      var reset = options && options.reset;
      if (this.searchParams && (reset || this.maxCount===undefined || this.length < this.maxCount)) {
        reset && (options.url = this.url(options));
        return defaults.fetch.apply(this, arguments);
      } else {
        return $.Deferred().resolve().promise();
      }
    },

    url: function (options) {
      //var path = 'forms/nodes/create',
      var path = 'businessobjects',
          skipCount = (options && options.reset) ? 0 : (this.skipCount || 0),
          params = _.omit(
              _.defaults(
                  {
                    bo_type_id: this.boSearchModel.get("bo_type_id"),
                    limit: this.topCount,
                    page: this.topCount ? Math.floor(skipCount / this.topCount) + 1 : undefined
                  },
                  mapobj(this.searchParams, function (keyval) {
                    return ["where_" + keyval[0], keyval[1]];
                  }, this)), function (value) {
                return value === null || value === '';
              }),
          resource = path + '?' + $.param(params),
          baseurl  = this.connector.connection.url;
      //var url = base.Url.combine(baseurl, resource);
      var url = base.Url.combine(baseurl && baseurl.replace('/v1', '/v2') || baseurl, resource);
      return url;
    },

    parse: function (response,options) {
      function parcmp(pnew,cnew) {
        var result;
        if (cnew) {
          var pcount = 0;
          for (var ii = 0; ii<cnew.length; ii++) {
            var celnew = cnew[ii];
            pcount += (pnew[celnew.fieldName]!==undefined) ? 1 : 0;
          }
          if (pcount===0) {
            result = "incompatible";
          }
        }
        return result;
      }
      function colcmp(cold,cnew) {
        var result;
        if (cnew) {
          for (var ii = 0; ii<cnew.length; ii++) {
            var celnew = cnew[ii], celold = cold[ii];
            if (!celold || celold.fieldName!==celnew.fieldName) {
              return "incompatible";
            } else if (celold.fieldLabel!==celnew.fieldLabel
                       || celold.position!==celnew.position
                       || celold.length!==celnew.length) {
              result = "significant";
            }
          }
        }
        return result;
      }
      //this.response = response;
      delete this.errorMessage;
      var rows = [];
      if (this.searchParams && response && response.results) {
        var columnDescriptions = response.results.column_descriptions,
            pardiff = ( $.isEmptyObject(this.searchParams)|| $.isEmptyObject(columnDescriptions) ) ? "significant" : parcmp(this.searchParams,columnDescriptions),
            coldiff,
            ok = (pardiff!=="incompatible");
        if (ok && !options.reset && this.columnDescriptions) {
          coldiff = colcmp(this.columnDescriptions, columnDescriptions);
          ok = (coldiff!=="incompatible");
        }
        if (!ok) {
          // raise an error, if old and new columns and mapped values are incompatible
          this.errorMessage = BoResultCollection.ERR_COLUMNS_CHANGED;
        } else {
          if (!columnDescriptions || !columnDescriptions.length) {
            // if column descriptions are undefined or empty use businessobjectid as default column.
            columnDescriptions = [{
                  fieldLabel: "Business Object ID",
                  fieldName: "businessObjectId",
                  keyField: "",
                  length: 15,
                  position: 1
                }];
          }
          var searchedParams = _.extend({}, this.searchParams);
          var searchedForms = _.extend({}, this.searchForms);
          var mappedValues = {};
          // rebuild columns on reset, first fetch or if column descriptions have any difference
          // column differences must be compatible at that point, as this was checked above.
          if (options.reset || !this.columnDescriptions || pardiff==="significant" || coldiff==="significant") {
            var normDescrs  = [],
                labelToKey  = {},
                nameToKey   = {},
                totalLength = 0,
                columnCount = 0,
                smallestLength,
                longestLength;
            _.each(columnDescriptions, function (attributes, index) {
              // input_attributes_are_like: {
              //   fieldLabel: "Ct",
              //   fieldName: "ATTYP",
              //   keyField: "",
              //   length: 2,
              //   position: 1
              // },
              // var column_key = attributes.fieldName || attributes.fieldLabel;
              // column_key = column_key && column_key.replace(/[^a-z-_A-Z0-9]/g,"_");
              var column_key = "conws_col_" + index,
                  labelLength = 0;
              // build value map if given and also use the mapped values for field length calculation
              if (searchedForms
                  && searchedForms.options
                  && searchedForms.options.fields
                  && searchedForms.options.fields[attributes.fieldName]
                  && searchedForms.options.fields[attributes.fieldName].optionLabels
                  && searchedForms.schema
                  && searchedForms.schema.properties
                  && searchedForms.schema.properties[attributes.fieldName]
                  && searchedForms.schema.properties[attributes.fieldName].enum
                  && searchedForms.options.fields[attributes.fieldName].optionLabels.length
                     === searchedForms.schema.properties[attributes.fieldName].enum.length) {
                var labels = searchedForms.options.fields[attributes.fieldName].optionLabels,
                    values = searchedForms.schema.properties[attributes.fieldName].enum,
                    map = mappedValues[column_key] = {};
                _.each(labels, function (label, mapidx) {
                  map[values[mapidx]] = label;
                  if (label.length>labelLength) {
                    labelLength = label.length
                  }
                }, this);
              }
              var normalized = _.extend({
                align: "left",
                name: attributes.fieldLabel,
                persona: "",
                sort: true,
                type: -1 /* for string*/,
                width_weight: 0
              }, attributes, {
                correctedLength: getLeveledLength(attributes.length,attributes.fieldLabel,labelLength),
                column_key: column_key
              });
              if (normalized.correctedLength) {
                // only if length or field label is set use length for average calculation
                // columns with unset length are assumed to get average length
                totalLength += normalized.correctedLength;
                columnCount += 1;
                if (smallestLength===undefined || normalized.correctedLength<smallestLength) {
                  smallestLength = normalized.correctedLength;
                }
                if (longestLength===undefined || normalized.correctedLength>longestLength) {
                  longestLength = normalized.correctedLength;
                }
              }
              normDescrs.push(normalized);
              labelToKey[normalized.fieldLabel] = normalized.column_key;
              nameToKey[normalized.fieldName] = normalized.column_key;
            }, this);
            // set width factors according corrected length (depending on length AND field label)
            // so variation of length is not too wide, in order to avoid truncated fields.
            var defaultKey, lowestSequence,
                tableColumns = _.map(normDescrs,function (column) {
                  var key      = column.column_key,
                      sequence = column.position + 1;
                  if (sequence !== undefined) {
                    if (lowestSequence === undefined || sequence < lowestSequence) {
                      lowestSequence = sequence;
                      defaultKey = key;
                    }
                  }
                  defaultKey || (defaultKey = key);
                  return {key: key, sequence: sequence};
                });

            if (columnCount>1
                && smallestLength && smallestLength>0
                && longestLength && longestLength>smallestLength) {
              // ensure, that smallest length is not smaller than minimal factor of average length.
              // compute a correction length accordingly and apply it on all column lengths.
              // This is done to avoid truncated headers while reflecting the expected field lengths.
              var averageLength = totalLength/columnCount,
                  minFactor = getMinFactor(smallestLength,averageLength,longestLength),
                  minLength = averageLength * minFactor,
                  correctionLength = smallestLength<minLength ? (minFactor*averageLength-smallestLength)/(1-minFactor) : 0,
                  widthFactorSum = 0,
                  maxWidthFactor = 0,
                  maxWidthFactorIndex = 0;
              log.debug("minFactor {0}",minFactor) && console.log(log.last)
              averageLength += correctionLength;
              _.each(normDescrs,function(normalized,index){
                // now set width factors. length = 0 is assumed to have average Length.
                normalized.correctedLength = normalized.correctedLength ? normalized.correctedLength+correctionLength : averageLength;
                var widthFactor = normalized.correctedLength / averageLength;
                log.debug("widthFactor {0}",widthFactor) && console.log(log.last)
                tableColumns[index].widthFactor =  widthFactor;
                widthFactorSum += widthFactor;
                if (widthFactor>=maxWidthFactor) {
                  maxWidthFactor = widthFactor;
                  maxWidthFactorIndex = index;
                }
              }, this);
              log.debug("widthFactorSum {0}",widthFactorSum) && console.log(log.last)
              var widthFactorRest = columnCount - widthFactorSum;
              log.debug("widthFactorRest {0}",widthFactorRest) && console.log(log.last)
              if (widthFactorRest!==0) {
                maxWidthFactor += widthFactorRest;
                widthFactorSum += widthFactorRest;
                tableColumns[maxWidthFactorIndex].widthFactor = maxWidthFactor;
                log.debug("widthFactorSum {0}",widthFactorSum) && console.log(log.last)
              }
            }

            this.orderByDefaultKey = defaultKey;
            this.mappedValues = mappedValues;
            this.labelToKey = labelToKey;
            this.nameToKey = nameToKey;
            this.columns.reset(normDescrs, {silent: true});
            this.tableColumns.reset(tableColumns);
            this.columnDescriptions = response.results.column_descriptions;
          }

          this.searchedParams = searchedParams;
          this.searchedForms = searchedForms;

          if (response.results.result_rows) {
            var needCount = this.maxCount===undefined ? this.topCount : Math.min(this.topCount, this.maxCount - this.length);
            for (var rowindex = 0; rowindex < needCount; rowindex++) {
              if (rowindex >= response.results.result_rows.length) {
                break;
              }
              var attributes = response.results.result_rows[rowindex];
              var row = _.extend(mapobj(attributes, function (keyval) {
                var key = this.labelToKey[keyval[0]] || this.nameToKey[keyval[0]] || keyval[0],
                    map = this.mappedValues[key],
                    val = (map && map[keyval[1]]) || keyval[1];
                return [key, val];
              }, this), {
                id: attributes.rowId
              });
              rows.push(row);
            }
          }

          this.totalCount = response && response.paging && response.paging.total_count;
          if (options.reset) {
            this.skipCount = 0;
          }
          this.maxRowsExceeded = response && response.results && response.results.max_rows_exceeded;

        }
      }
      return rows;
    }

  });

  return BoResultCollection;

});

/**
 * Created by stefang on 05.04.2016.
 */
csui.define('xecmpf/controls/bosearch/resultlist/botable.view',['require', 'csui/lib/jquery', 'csui/lib/underscore', 'csui/utils/log',
  "csui/lib/backbone", 'csui/lib/marionette',
  'csui/controls/table/table.view',
  "csui/lib/jquery.dataTables.tableTools/js/dataTables.tableTools",
  'xecmpf/controls/bosearch/resultlist/boresult.collection',
  'i18n!xecmpf/controls/bosearch/impl/nls/lang'
], function (require, $, _, log,
    Backbone, Marionette,
    TableView,
    TableTools,
    BoResultCollection,
    lang
) {

  function getOption(property) {
    var options = this.options || {};
    var value = options[property];
    return _.isFunction(value) ? options[property].call(this.view) : value;
  }

  var InfiniteTableScrollingBehavior = Marionette.Behavior.extend({

    defaults: {
      content: null,
      contentParent: null,
      fetchMoreItemsThreshold: 95
    },

    constructor: function InfiniteTableScrollingBehavior(options, view) {
      Marionette.Behavior.prototype.constructor.apply(this, arguments);
      view.infiniteScrollingBehavior = this;
      this.listenTo(view, 'render', this._bindScrollingEvents);
      this.listenTo(view, 'before:destroy', this._unbindScrollingEvents);
    },

    _scrollToPosition: function (scrollPosition,where) {
      // if possible, scroll given position to "middle", "top" or "bottom" of visible area
      // otherwise scroll to the nearest visible position without triggering an additional fetch.
      var contentParent = getOption.call(this, 'contentParent'),
          parentHeight = this._contentParent.height(),
          content = getOption.call(this, 'content'),
          contentEl = content ? this.view.$(content) :
                      contentParent ? this._contentParent.children().first() :
                      this.view.$el,
          contentHeight = _.reduce(contentEl, function(sum,el){return sum+$(el).height()},0);
      if (contentHeight<parentHeight) {
        scrollPosition = 0
      } else {
        if (where==="middle") {
          scrollPosition = scrollPosition - parentHeight / 2;
        } else if (where==="bottom") {
          scrollPosition =  scrollPosition - parentHeight;
        }
        scrollPosition =  Math.floor(scrollPosition);
        if (scrollPosition < 0) {
          scrollPosition = 0
        } else {
          var fetchMoreItemsThreshold = getOption.call(this, 'fetchMoreItemsThreshold'),
              scrollableHeight = Math.floor((contentHeight-parentHeight)*(fetchMoreItemsThreshold/100.0));
          if (scrollPosition>=scrollableHeight) {
            scrollPosition = scrollableHeight-1; // ensure, that no fetch is triggered
          }
        }
      }
      this._contentParent.scrollTop(scrollPosition);
    },

    scrollTop: function (scrollPosition) {
      this._scrollToPosition(scrollPosition,"top");
    },

    scrollMiddle: function (scrollPosition) {
      this._scrollToPosition(scrollPosition,"middle");
    },

    scrollBottom: function (scrollPosition) {
      this._scrollToPosition(scrollPosition,"bottom");
    },

    _bindScrollingEvents: function () {
      this._unbindScrollingEvents();
      var contentParent = getOption.call(this, 'contentParent');
      this._contentParent = contentParent ? this.view.$(contentParent) : this.view.$el;
      this._contentParent.on('scroll.' + this.view.cid, _.bind(this._checkScrollPosition, this));
    },

    _checkScrollPosition: function () {
      var contentParent = getOption.call(this, 'contentParent'),
          content = getOption.call(this, 'content'),
          contentEl = content ? this.view.$(content) :
                      contentParent ? this._contentParent.children().first() :
                      this.view.$el,
          fetchMoreItemsThreshold = getOption.call(this, 'fetchMoreItemsThreshold'),
          contentHeight = _.reduce(contentEl, function(sum,el){return sum+$(el).height()},0),
          scrollableHeight = contentHeight - this._contentParent.height(),
          lastScrollPosition = this._contentParent.scrollTop(),
          scrollablePercentage = lastScrollPosition * 100 / scrollableHeight;
      this.view.lastScrollPosition = lastScrollPosition;
      if (scrollablePercentage >= fetchMoreItemsThreshold) {
        this._checkScrollPositionFetch();
      }
    },

    _checkScrollPositionFetch: function () {
      var collection = this.view.collection;
      if (collection.length < collection.totalCount && !collection.fetching &&
          collection.skipCount < collection.length) {
        log.debug('fetching from {0}', collection.length) && console.log(log.last);
        var oldSkip = collection.skipCount;
        collection.setSkip(collection.length, false);
        var contentParent = getOption.call(this, 'contentParent');
        // to fix CWS-1546, just send a mouseup event to the scrollbar, so the drag
        // operation ends and element is sensitive again. And: sending this event obviously
        // does not harm the other scenarios, for example when scrolling with the mouse wheel.
        // if one finds a beter solution, for exampletirggering this mouseup only if a drag
        // operation is in progress, then feel free to update the code here.
        this.$(".ps-scrollbar-y-rail").mouseup();
        collection.fetch({
          reset: false,
          remove: false,
          merge: false,
          silent: true,
          success: _.bind(function () {
            if (collection.errorMessage && collection.errorMessage===BoResultCollection.ERR_COLUMNS_CHANGED) {
              collection.setSkip(oldSkip,false);
              if (this.view.lastScrollPosition>0) {
                this.view.$(contentParent).scrollTop(this.view.lastScrollPosition-1);
              }
            } else {
              this.view.render();
            }
          }, this)
        });
      }
    },

    _unbindScrollingEvents: function () {
      if (this._contentParent) {
        this._contentParent.off('scroll.' + this.view.cid);
      }
    }

  });

  var InfiniteScrollingTableView = TableView.extend({

    events: {
      'keydown': 'onKeyDown'
    },

    behaviors: _.defaults({
          InfiniteScrolling: {
            behaviorClass: InfiniteTableScrollingBehavior,
            contentParent: 'tbody',
            content: 'tbody>tr:visible',
            fetchMoreItemsThreshold: 100
          }
        },
        TableView.prototype.behaviors),

    constructor: function InfiniteScrollingTableView() {
      TableView.prototype.constructor.apply(this, arguments);
      this.listenTo(this,"clicked:cell", this._clickedCell);
      // this.listenTo(this,"row:clicked", this._clickedRow);
      if (this.options.disableItemsWithWorkspace){
          this.listenTo(this, "tableRowRendered", this._disableRow);  
      }

      this.listenTo(this.collection, "request", function(model,xhr,options) {
        // clear scroll position when fetch with reset:true is triggered
        if (options.reset) {
          delete this.lastScrollPosition;
        }
      });
    },

    _disableRow: function(event){
        var eventTarget = event.target;
        var node = event.node;
        if (node.get("has_workspace")){
            var row = $(eventTarget); 
            row.addClass("conws-boresulttable-disabled-row");
            row.off("pointerenter"); //disable pointer events to avoid highlighting the rows
            row.off("pointerleave");
            row.find("td").not('.csui-table-cell-_toggledetails').off("click"); // disable cell click except for the expand/collapse details button.
        }
   },

    onKeyDown: function (event) {
      // handle tab, space, enter only for selectRows single
      if (this.options && this.options.selectRows === 'single') {
        if (event.keyCode === 32 || event.keyCode === 13) {
          var btoggleDetails = event.target.classList.contains('csui-table-cell-_toggledetails');
          if (!btoggleDetails) { // it's  not a toggle cell
            event.preventDefault();
            event.stopPropagation();
            event.target.click();
          }
        }
      }
    },

    _clickedCell: function(cellEventInfo) {
      if (!this.ignoreSelectEvents) {
        var selectedRow = {
          model: cellEventInfo.model,
          // index: cellEventInfo.rowIndex,
          target: this.table.row(cellEventInfo.rowIndex).node()
        };
        this.lastSelectedRow = selectedRow;
        this.trigger("row:selected",selectedRow);
      }
    },

    // _clickedRow: function(rowEventInfo) {
    //   if (!this.ignoreSelectEvents) {
    //     var selectedRow = {
    //       model: rowEventInfo.node,
    //       // index: rowEventInfo.node.get("rowId")-1;
    //       target: rowEventInfo.target
    //     };
    //     this.lastSelectedRow = selectedRow;
    //     this.trigger("row:selected",selectedRow);
    //   }
    // },

    setSelection: function(selectedNodesById,selected) {

      this.ignoreSelectEvents = true;

      selected = selected || selected===undefined;
      function getTableTools() {
        return this.tableTools ||
               (this.tableTools = TableTools.fnGetInstance(this.table.table().node()));
      }
      function selectRowsByNodeIds(selectedNodesById) {
        if (this.table && selectedNodesById) {
          _.each(selectedNodesById,function(id) {
            var node = this.collection.get(id),
                position = this.collection.indexOf(node),
                tt = getTableTools.call(this),
                trNode = this.table.row(position).node();
            if (selected) {
              tt.fnSelect(trNode);
            } else {
              tt.fnDeselect(trNode);
            }
          },this);
        }
      }
      selectRowsByNodeIds.call(this,selectedNodesById);
      delete this.lastSelectedRow;
      if (this.table && selectedNodesById && selectedNodesById.length>0 && selected) {
        var id = selectedNodesById[0],
            node = this.collection.get(id),
            position = this.collection.indexOf(node),
            trNode = this.table.row(position).node();
        this.lastSelectedRow = {
          model: node,
          // index: position,
          target: $(trNode)
        };
      }

      if (this.lastSelectedRow && this.infiniteScrollingBehavior) {
        var lastSelectedMiddle = this.lastSelectedRow.target.position().top + this.lastSelectedRow.target.height()/2;
        this.infiniteScrollingBehavior.scrollMiddle(lastSelectedMiddle);
      }

      delete this.ignoreSelectEvents;

    },

    clearSelection: function() {

      this.ignoreSelectEvents = true;

      // forget last selected row
      delete this.lastSelectedRow;

      // clear selection state in rows
      this.clearChildrenSelection();

      if (this.lastScrollPosition!==undefined && this.infiniteScrollingBehavior) {
        this.infiniteScrollingBehavior.scrollTop(this.lastScrollPosition);
      }

      delete this.ignoreSelectEvents;

    }

  });

  return InfiniteScrollingTableView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/bosearch/resultlist/impl/boresultlist',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "      <div class=\"conws-boresultbanner-container\">\r\n        <div class=\"conws-boresultbanner\">"
    + this.escapeExpression(((helper = (helper = helpers.banner_message || (depth0 != null ? depth0.banner_message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"banner_message","hash":{}}) : helper)))
    + "</div>\r\n      </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"conws-boresultlist-body\">\r\n  <div class=\"conws-boresulttable\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.banner_message : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "  </div>\r\n  <div class=\"conws-boresultfooter\">\r\n    <div class=\"conws-boresultfooter-message-container  binf-modal-footer\">\r\n      <div class=\"conws-boresultfooter-message\">"
    + this.escapeExpression(((helper = (helper = helpers.footer_message || (depth0 != null ? depth0.footer_message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"footer_message","hash":{}}) : helper)))
    + "</div>\r\n    </div>\r\n    <div class=\"conws-boresultfooter-attach-container  binf-modal-footer\">\r\n      <button type=\"button\" disabled class=\"binf-btn binf-btn-default attach\">"
    + this.escapeExpression(((helper = (helper = helpers.attach_button_text || (depth0 != null ? depth0.attach_button_text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"attach_button_text","hash":{}}) : helper)))
    + "</button>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_bosearch_resultlist_impl_boresultlist', t);
return t;
});
/* END_TEMPLATE */
;
/**
 * Created by stefang on 05.04.2016.
 */
csui.define('xecmpf/controls/bosearch/resultlist/boresultlist.view',['require', 'csui/lib/jquery', 'csui/lib/underscore',
  "csui/lib/backbone", 'csui/lib/marionette',
  'csui/utils/base', 'csui/utils/log',
  'csui/utils/contexts/factories/connector',
  'csui/dialogs/modal.alert/modal.alert',
  'xecmpf/controls/bosearch/resultlist/botable.view',
  'xecmpf/controls/bosearch/resultlist/boresult.collection',
  'hbs!xecmpf/controls/bosearch/resultlist/impl/boresultlist',
  'i18n!xecmpf/controls/bosearch/impl/nls/lang'
], function (require, $, _,
    Backbone, Marionette,
    base, log,
    ConnectorFactory,
    ModalAlert,
    InfiniteScrollingTableView,
    BoResultCollection,
    template, lang
) {

  var BusinessObjectResultListView = Marionette.LayoutView.extend({

    className: 'conws-boresultlist',
    template: template,

    regions: {
      tableRegion: '.conws-boresulttable'
    },

    triggers: {
      "click .binf-btn.attach": "attach:clicked"
    },

    constructor: function BusinessObjectResultListView(options) {

      options || (options = {});

      Marionette.LayoutView.prototype.constructor.call(this, options);

      this.listenTo(this.model, "change:bo_type_name", this._updateBanner);
      this.listenTo(this.model, "bosearch:search", this._triggerSearch);
      this.listenTo(this, "attach:clicked", this._triggerAttach);
    },

    _triggerSearch : function(searchEventInfo) {
      // get form data, set in result collection and trigger fetch.

      // first create empty collection and table view
      if (!this.collection) {
        this.collection = new BoResultCollection(undefined,
            {
              connector: this.options.context.getObject(ConnectorFactory),
              boSearchModel: this.options.model,
              autoreset: true
            });
        this.render();
        this.listenTo(this.collection,"sync",this._updateFooter);
        this.listenTo(this.collection,"sync",this._showSyncError);
        this.listenTo(this.collection,"error",this._showSearchError);
      }
      // then do search and table view renders triggered by model events and shows busy indicator
      this.collection.searchParams = searchEventInfo ? searchEventInfo.searchParams : undefined;
      this.collection.searchForms = searchEventInfo ? searchEventInfo.searchForms : undefined;

      // focus on first row in result list
      var that = this;
      this.collection.fetch({reset: true}).then(function(){
        var curFocus = that.resultTable.currentlyFocusedElement();
        if (curFocus) {
          curFocus.focus();
        }
      });


      // After search selected:
      // show attach button
      // SAPRM-9320: if metadata mapping is enabled for bus. attachments then nevertheless
      //             no attach button is shown but a single select table is displayed
      var bus_att_metadata_mapping = this.model.get("bus_att_metadata_mapping");
      if (this.options.multipleSelect && !bus_att_metadata_mapping ){
        var elem = this.$el.find(".conws-boresultfooter>.conws-boresultfooter-attach-container");
        if (elem) {
          elem.css({"display": "block"});
          // Reset attach button to disabled as no item is selected after search
          var attBtn = elem.children();
          if ( attBtn ) {
            attBtn[0].disabled = true;
          }
        }
        // here is the best place to add space for attach button
        this.$el.addClass('conws-with-attachbtn');
      }
    },

    _selectedRow: function(selectedRow) {
      log.debug("trigger reference:clicked") && console.log(log.last);
      this.listenToOnce(this.model,"reference:selected",function() {
        $(selectedRow.target).mouseleave(); // remove hover style at end of selection process
      });
      this.model.trigger("boresult:select",{selectedItems:[selectedRow.model]});
    },

    _enableAttachBtn: function(selectedRow){
      if ( selectedRow.nodes.length > 0 ){
        var selChilds = this.resultTable.getSelectedChildren();
        if ( selChilds.length > 0 ) {
          var elem = this.$el.find(".conws-boresultfooter .binf-btn.binf-btn-default.attach");
          if (elem) {
            elem[0].disabled = false;
          }
        }
      }
    },

    _disableAttachBtn: function(selectedRow){
      if ( selectedRow.nodes.length > 0 ){
        var selChilds = this.resultTable.getSelectedChildren();
        if ( selChilds.length === 0 ) {
          var elem = this.$el.find(".conws-boresultfooter .binf-btn.binf-btn-default.attach");
          if (elem) {
            elem[0].disabled = true;
          }
        }
      }
    },

    templateHelpers: function () {
      return {
        banner_message: this._getBannerMessage(),
        footer_message: this._getFooterMessage(),
        attach_button_text: lang.boResultListButtonAttach,
      };
    },

    _updateBanner: function () {
      var msg = this._getBannerMessage();
      if (msg) {
        this.$el.find(".conws-boresultbanner").text(this._getBannerMessage());
      }
    },

    _getBannerMessage: function () {
      return this.collection ? undefined : _.str.sformat(lang.resultListBannerMessage,this.model.get("bo_type_name"));
    },

    _updateFooter: function() {
      var msg = this._getFooterMessage();
      if (msg) {
        this.$el.find(".conws-boresultfooter-message").text(msg);
        this.$el.addClass("conws-with-footer");
      } else {
        this.$el.removeClass("conws-with-footer");
      }
    },

    _getFooterMessage: function () {
      return (this.collection && this.collection.maxRowsExceeded) ? lang.resultListRefineMessage : undefined;
    },

    _showSyncError: function () {
      if (this.collection.errorMessage && this.collection.errorMessage===BoResultCollection.ERR_COLUMNS_CHANGED) {
        ModalAlert.showError(lang[this.collection.errorMessage]||this.collection.errorMessage);
      }
    },

    _showSearchError: function (model,response,options) {
      var errmsg = response && (new base.Error(response)).message || lang.errorSearchingBusinessObjects;
      log.error("Searching for business objects failed: {0}",errmsg) && console.error(log.last);
      ModalAlert.showError(errmsg);
    },

    _triggerAttach : function() {
      // SAPRM-9320: together with this topic the events are aligned
      // log.debug("trigger reference:selected") && console.log(log.last);
      // this.model.trigger("reference:selected",{selectedItems:this.resultTable.getSelectedChildren()});
      log.debug("trigger boresult:select") && console.log(log.last);
      this.model.trigger("boresult:select",{selectedItems:this.resultTable.getSelectedChildren()});
    },

    onRender: function() {
      this._updateFooter();
      if (this.collection) {
        var selectRows = "single";
        var selectColumn = false;
        // SAPRM-9320: if metadata mapping is enabled for bus. attachments then nevertheless
        //             no attach button is shown but a single select table is displayed
        var bus_att_metadata_mapping = this.model.get("bus_att_metadata_mapping");
        if ( this.options.multipleSelect && ! bus_att_metadata_mapping ) {
          selectRows = "multiple";
          selectColumn = true;
        }
        var enableSorting = true;
		
        if (this.options.enableSorting !== undefined){
          enableSorting = this.options.enableSorting;
        }
        
        this.resultTable = new InfiniteScrollingTableView({
          context: this.options.context,
          connector: this.options.context.getObject(ConnectorFactory),
          collection: this.collection,
          columns: this.collection.columns,
          tableColumns: this.collection.tableColumns,
          selectRows: selectRows,
          selectColumn: selectColumn,
          enableSorting: enableSorting,
          //orderBy: this.collection.orderByDefaultKey && (this.collection.orderByDefaultKey + ' asc'),
          nameEdit: false,
          haveDetailsRowExpandCollapseColumn: true,
          disableItemsWithWorkspace: this.options.disableItemsWithWorkspace,
          //columnsWithSearch: columns,
          tableTexts: {
            zeroRecords: lang.noBusinessObjectsFound
          }
        });
        // SAPRM-9320: if metadata mapping is enabled for bus. attachments then nevertheless
        //             no attach button is shown but a single select table is displayed
        if (!this.options.multipleSelect || bus_att_metadata_mapping) {
          this.listenTo(this.resultTable,"row:selected", this._selectedRow);
        }
        else {
          this.listenTo(this.resultTable,"tableRowSelected", this._enableAttachBtn);
          this.listenTo(this.resultTable,"tableRowUnselected", this._disableAttachBtn);
        }
        this.tableRegion.show(this.resultTable);
      } else if (this.resultTable) {
        this.stopListening(this.resultTable);
        delete this.resultTable;
      }
    }

  });

  return BusinessObjectResultListView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/bosearch/impl/bosearch',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"conws-bosearch-wrapper\">\r\n  <div class=\"conws-bosearch-panel\">\r\n    <div class=\"conws-bosearch-title\">\r\n      "
    + this.escapeExpression(((helper = (helper = helpers.bosearch_title || (depth0 != null ? depth0.bosearch_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"bosearch_title","hash":{}}) : helper)))
    + "\r\n    </div>\r\n    <div class=\"conws-bosearch-form\">\r\n    </div>\r\n    <div class=\"conws-bosearch-result\">\r\n    </div>\r\n  </div>\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_bosearch_impl_bosearch', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/bosearch/impl/bosearch',[],function(){});
/**
 * Created by stefang on 05.04.2016.
 */
csui.define('xecmpf/controls/bosearch/bosearch.view',['require',
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/lib/marionette',
  'csui/widgets/metadata/metadata.view',
  'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
  'xecmpf/controls/bosearch/searchform/bosearchform.view',
  'xecmpf/controls/bosearch/resultlist/boresultlist.view',
  'hbs!xecmpf/controls/bosearch/impl/bosearch',
  'css!xecmpf/controls/bosearch/impl/bosearch'
], function (require, $, _,
    Marionette,
    MetadataView /* load metadata.css to have the styles and the same load order always */,
    LayoutViewEventsPropagationMixin,
    BoSearchFormView,
    BoResultListView,
    template
) {

  var BusinessObjectSearchView = Marionette.LayoutView.extend({

    className: 'conws-bosearch csui-metadata-overlay',
    template: template,

    regions: {
      searchRegion: '.conws-bosearch-form',
      resultRegion: '.conws-bosearch-result'
    },

    constructor: function BusinessObjectSearchView(options) {
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
      this.propagateEventsToRegions();
      this.listenTo(this.model,"reference:search",this._referenceSearchOpen);
    },

    templateHelpers: function () {
      return {
        bosearch_title: this.options.title
      };
    },

    onRender: function () {
      // LayoutView destroys views on rendering, so we must create them every time on rendering
      this.searchView = new BoSearchFormView({model: this.model, context: this.options.context});
      this.resultView = new BoResultListView({
        model: this.model, context: this.options.context,
        multipleSelect: this.options.multipleSelect,
        enableSorting:  false,
        disableItemsWithWorkspace: this.options.disableItemsWithWorkspace
      });

       if (this.options.title){
         this.$el.addClass("display-title");
       }

      this.searchRegion.show(this.searchView);
      this.resultRegion.show(this.resultView);
    },

    _referenceSearchOpen: function() {
      // TODO: where to place this code? seems a little bit tricky here, to do ALL these things.
      // TODO: do this before the animation and not during it, to have a smooth slide-in.
      var bosearchview = this;
      if (bosearchview.searchView && bosearchview.searchView.searchForm) {
        bosearchview.searchView.searchForm.$el.hide();
        var old_id = bosearchview.searchView.searchForm.model.get("id"),
            new_id = bosearchview.searchView.model.get("bo_type_id");
        if (old_id!==new_id) {
          if (bosearchview.resultView && bosearchview.resultView.collection) {
            delete bosearchview.resultView.collection;
            bosearchview.resultView.render();
          }
        }
        // be sure to use bo_type_id in model of search view also for the search form
        bosearchview.searchView.searchForm.model.set({
          "id": new_id,
          "name": bosearchview.searchView.model.get("bo_type_name")
        });
        bosearchview.searchView.searchForm.model
            .fetch({reset:true,silent:true})
            .then(function() {
              if (bosearchview.resultView
                  && bosearchview.resultView.collection
                  && bosearchview.resultView.collection.searchedParams) {
                // if we already have a result, get values for search fields from there
                var searchData = bosearchview.searchView.searchForm.model.get("data"),
                    keysSearchData = _.keys(searchData),
                    searchedParams = bosearchview.resultView.collection.searchedParams,
                    nsearchData = keysSearchData.length,
                    nsearchedParams = _.keys(searchedParams).length,
                    matchKeyCount = _.reduce(searchData,function(count,val,key){
                      return (key in searchedParams) ? count + 1 : count;
                    },0);
                // but do this only if at least half of the keys from last search exist in new
                // search form as well. Otherwise we consider both as too different and showing
                // the last result for the new search form looks strange.
                // but in case of zero search fields we have to check the plain difference between
                // last and current search fields
                if (( matchKeyCount>0 && matchKeyCount>=keysSearchData.length/2 ) || ( nsearchData === nsearchedParams) ) {
                  // extend search data an render search form with it
                  _.extend(searchData,_.pick(searchedParams,keysSearchData));
                  if (bosearchview.resultView.resultTable) {
                    var row_id = bosearchview.model.get("row_id");
                    if (row_id && bosearchview.resultView.resultTable.collection.get(row_id)) {
                      bosearchview.resultView.resultTable.setSelection([row_id]);
                    } else {
                      bosearchview.resultView.resultTable.clearSelection();
                    }
                  }
                } else {
                     var oColl = bosearchview.resultView.collection;
                     delete bosearchview.resultView.collection;
                     if (oColl){
                       oColl.stopListening();
                       bosearchview.resultView.stopListening(oColl);
                     }
                  bosearchview.resultView.render();
                }
              }
              bosearchview.searchView.searchForm.render();
              bosearchview.searchView.searchForm.$el.show();
            }, function() {
              bosearchview.searchView.searchForm.$el.show();
            });
      }
    }

  });

  _.extend(BusinessObjectSearchView.prototype, LayoutViewEventsPropagationMixin);

  return BusinessObjectSearchView;
});




/**
 * Created by stefang on 05.04.2016.
 */
csui.define('xecmpf/controls/bosearch/bosearch.dialog.controller',['require',
  'csui/lib/jquery',
  'csui/lib/underscore',
  'csui/lib/marionette',
  'xecmpf/controls/bosearch/bosearch.view'
], function (require, $, _,
    Marionette,
    BoSearchView
) {

  var BoSearchDialogController = Marionette.Controller.extend({
    
    constructor: function BoSearchDialogController(options) {
      Marionette.Controller.prototype.constructor.apply(this, arguments);

      this.listenTo(this.options.boSearchModel,"reference:search",this._referenceSearchOpen);
      this.listenTo(this.options.boSearchModel, "boresult:select", this._boresultSelect);
      this.listenTo(this.options.boSearchModel,"reference:selected",this._referenceSelected);
      this.listenTo(this.options.boSearchModel,"reference:rejected",this._referenceRejected);
      this.listenTo(this.options.boSearchModel,"bosearch:cancel",this._referenceSearchCanceled);
    },

    _transitionEnd: _.once(
        function () {
          var transitions = {
                transition: 'transitionend',
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend'
              },
              element = document.createElement('div'),
              transition;
          for (transition in transitions) {
            if (typeof element.style[transition] !== 'undefined') {
              return transitions[transition];
            }
          }
        }
    ),

    _referenceSearchOpen: function () {
      this._showSearchView();
    },

    _boresultSelect: function () {
      this._showModalContent(); // also shows blocking circle
    },

    _referenceSelected: function () {
      this._hideSearchView();
    },

    _referenceRejected: function () {
      this._hideModalContent();
    },

    _referenceSearchCanceled: function () {
      this._showModalContent();
      this._hideSearchView();
    },

    _hideSearchView : function() {
      if (this.options.mode==="workspace_reference_edit") {
        this.bosearchview.$el.parent().removeClass('cs-item-action-metadata');
      }
      if (this.options.mode==="business_attachment_add") {
        this.bosearchview.$el.parent().removeClass('cs-item-action-metadata');
      }
      this.modalcontent.removeClass('conws-bosearch-showing');
      this.bosearchview.$el.detach();
    },

    _showModalContent: function() {
      if (this.options.mode==="workspace_reference_create") {
        this.modalcontent.find(">.binf-modal-header .cs-close").show();
        this.modalcontent.find(">.binf-modal-body").show();
        this.modalcontent.find(">.binf-modal-footer").show();
      }
      if (this.options.mode==="workspace_reference_edit") {
        this.modalcontent.find(">.metadata-content-wrapper").show();
        this.modalcontent.find(">.metadata-wrapper .metadata-sidebar .cs-content").show();
        this.modalcontent.find(">.metadata-wrapper .metadata-content .metadata-content-wrapper").show();
      }
      if (this.options.mode==="business_attachment_add" ) {
        this.modalcontent.find(">.metadata-content-wrapper").show();
        this.modalcontent.find(">.metadata-wrapper .metadata-sidebar .cs-content").show();
        this.modalcontent.find(">.metadata-wrapper .metadata-content .metadata-content-wrapper").show();
      }
    },

    _hideModalContent: function () {
      if (this.options.mode==="workspace_reference_create") {
        this.modalcontent.find(">.binf-modal-header .cs-close").hide();
        this.modalcontent.find(">.binf-modal-body").hide();
        this.modalcontent.find(">.binf-modal-footer").hide();
      }
      if (this.options.mode==="workspace_reference_edit") {
        this.modalcontent.find(">.metadata-content-wrapper").hide();
        this.modalcontent.find(">.metadata-wrapper .metadata-sidebar .cs-content").hide();
        this.modalcontent.find(">.metadata-wrapper .metadata-content .metadata-content-wrapper").hide();
      }
      if (this.options.mode==="business_attachment_add" ) {
        this.modalcontent.find(">.metadata-content-wrapper").hide();
        this.modalcontent.find(">.metadata-wrapper .metadata-sidebar .cs-content").hide();
        this.modalcontent.find(">.metadata-wrapper .metadata-content .metadata-content-wrapper").hide();
      }
    },

    _showSearchView : function() {
      
      var options = this.options || {};
      
      this.modalcontent = $(this.options.htmlPlace);
      this.modalcontent.addClass('conws-bosearch-beforeshow');

      //if (this.bosearchview) {
        // in order to show last search result, after it was already searched for in the dialog,
        // do not delete view, just show it. it is registered on the event too and updates itself.
        // this.bosearchview.destroy();
        // delete this.bosearchview;
      //}
      if (!this.bosearchview) {
        this.bosearchview = new BoSearchView({
          model: this.options.boSearchModel,
          context: this.options.context,
          multipleSelect: this.options.multipleSelect,
          disableItemsWithWorkspace: this.options.disableItemsWithWorkspace,
          title: this.options.title
        });
        this.bosearchview.render();
        this.bosearchview.$el.addClass(this.options.mode);
        if (this.options.mode==="workspace_reference_create") {
          this.bosearchview.$el.addClass('csui-content-without-header');
        }
        if (this.options.mode==="workspace_reference_edit") {
          this.bosearchview.$el.addClass('csui-content-without-header');
          this.bosearchview.$el.find('>*').addClass('binf-modal-content');
        }
        if (this.options.mode==="business_attachment_add") {
          this.bosearchview.$el.addClass('csui-content-without-header');
          this.bosearchview.$el.find('>*').addClass('binf-modal-content');
          // SAPRM-9320:
          // space for attach button is dependent from metadata mapping of bus. attachment
          //this.bosearchview.$el.find('.conws-boresultlist').addClass('conws-with-attachbtn');
        }
      }

      this.modalcontent.append(this.bosearchview.$el);
      if (this.options.mode==="workspace_reference_edit") {
        this.bosearchview.$el.parent().addClass('cs-item-action-metadata');
      }
      if (this.options.mode==="business_attachment_add") {
        this.bosearchview.$el.parent().addClass('cs-item-action-metadata');
      }
      
      // read a property, so browser updates DOM and element is at start position
      this.bosearchview.$el.position();

      this.bosearchview.triggerMethod('dom:refresh');

      var that = this;
      this.bosearchview.$el.one(this._transitionEnd(), function () {
        that.modalcontent.removeClass("conws-bosearch-animating");
        that.modalcontent.addClass('conws-bosearch-showing');
        that._hideModalContent();
      });
      this.modalcontent.addClass('conws-bosearch-animating');
      this.modalcontent.removeClass('conws-bosearch-beforeshow');
    }

  });

  return BoSearchDialogController;
});





/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/property.panels/reference/impl/reference.panel',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <div class=\"conws-reference-override-note\">"
    + this.escapeExpression(((helper = (helper = helpers.override_note || (depth0 != null ? depth0.override_note : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"override_note","hash":{}}) : helper)))
    + "</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"conws-reference-panel binf-row alpaca-field\">\r\n  <div class=\"alpaca-container-label\">\r\n    <h3>"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "</h3>\r\n  </div>\r\n  <div class=\"conws-reference-initial\">\r\n  </div>\r\n  <div class=\"conws-reference-replace\">\r\n  </div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.change_reference : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_property.panels_reference_impl_reference.panel', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/property.panels/reference/impl/reference.panel-initial',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "  <div class=\"conws-label-search\">"
    + this.escapeExpression(((helper = (helper = helpers.search_button_label || (depth0 != null ? depth0.search_button_label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"search_button_label","hash":{}}) : helper)))
    + "</div>\r\n  <button type=\"button\" class=\"binf-btn binf-btn-default search\">"
    + this.escapeExpression(((helper = (helper = helpers.search_button_title || (depth0 != null ? depth0.search_button_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"search_button_title","hash":{}}) : helper)))
    + "</button>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "  <div  class=\"conws-reference-override-note\">"
    + this.escapeExpression(((helper = (helper = helpers.cannot_complete_business_reference || (depth0 != null ? depth0.cannot_complete_business_reference : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"cannot_complete_business_reference","hash":{}}) : helper)))
    + "</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.complete_reference : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_controls_property.panels_reference_impl_reference.panel-initial', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/property.panels/reference/impl/reference.panel-replace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "  <div class=\"conws-reference-buttons\">\r\n    <div class=\"conws-label-buttons\">"
    + this.escapeExpression(((helper = (helper = helpers.reference_buttons_label || (depth0 != null ? depth0.reference_buttons_label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"reference_buttons_label","hash":{}}) : helper)))
    + "</div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.allow_remove_reference : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "    <button type=\"button\" class=\"binf-btn binf-btn-default replace\">"
    + this.escapeExpression(((helper = (helper = helpers.replace_button_title || (depth0 != null ? depth0.replace_button_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"replace_button_title","hash":{}}) : helper)))
    + "</button>\r\n  </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "      <button type=\"button\" class=\"binf-btn binf-btn-default remove\">"
    + this.escapeExpression(((helper = (helper = helpers.remove_button_title || (depth0 != null ? depth0.remove_button_title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"remove_button_title","hash":{}}) : helper)))
    + "</button>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"conws-reference-metadata\"></div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.change_reference : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_controls_property.panels_reference_impl_reference.panel-replace', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/property.panels/reference/impl/reference.panel',[],function(){});
csui.define('xecmpf/controls/property.panels/reference/impl/reference.panel.view',[
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/backbone',
  'csui/lib/marionette',
  'csui/lib/alpaca/js/alpaca',
  'csui/utils/log',
  'csui/controls/form/form.view',
  'csui/utils/base',
  'csui/dialogs/modal.alert/modal.alert',
  'xecmpf/controls/bosearch/bosearch.model',
  'xecmpf/controls/bosearch/bosearch.dialog.controller',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'hbs!xecmpf/controls/property.panels/reference/impl/reference.panel',
  'hbs!xecmpf/controls/property.panels/reference/impl/reference.panel-initial',
  'hbs!xecmpf/controls/property.panels/reference/impl/reference.panel-replace',
  'i18n!xecmpf/controls/property.panels/reference/impl/nls/lang',
  'css!xecmpf/controls/property.panels/reference/impl/reference.panel'
], function (_, $, Backbone, Marionette, Alpaca, log, FormView,
    base, ModalAlert,
    BoSearchModel,
    BoSearchDialogController,
    TabableRegionBehavior, template, initialtmpl, replacetmpl, lang) {
  'use strict';

  var ReferenceInitialView = Marionette.ItemView.extend({

    className  : "conws-reference reference-initial",

    template   : initialtmpl,

    constructor: function ReferenceInitialView(options) {
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    ui: {
      searchButton: '.binf-btn.search'
    },

    triggers: {
      "click .binf-btn.search": "referencetab:search"
    },

    templateHelpers: function () {
      var bo_ref = this.options.actionContext.workspaceReference,
          bo_type_name = bo_ref && bo_ref.get("bo_type_name"),
          ext_system_name = bo_ref && bo_ref.get("ext_system_name");
      return {
        search_button_label: _.str.sformat(lang.referenceSearchButtonLabel,bo_type_name,ext_system_name),
        search_button_title: lang.referenceSearchButtonTitle,
        complete_reference: bo_ref.get("complete_reference"),
        cannot_complete_business_reference: lang.cannotCompleteBusinessReference
      };
    }
  });

  var ReferenceReplaceView = Marionette.LayoutView.extend({

    className  : "conws-reference reference-replace",

    template   : replacetmpl,

    constructor: function ReferenceReplaceView(options) {
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
    },

    ui: {
      replaceButton: '.binf-btn.replace'
    },

    triggers: {
      "click .binf-btn.remove" : "referencetab:remove",
      "click .binf-btn.replace": "referencetab:replace"
    },

    regions: {
      metadataRegion: '.conws-reference-metadata'
    },

    templateHelpers: function () {
      var bo_ref = this.options.actionContext.workspaceReference,
          bo_type_name = bo_ref && bo_ref.get("bo_type_name"),
          ext_system_name = bo_ref && bo_ref.get("ext_system_name");
      return {
        allow_remove_reference: this.options.actionContext.mode==="workspace_reference_create",
        remove_button_title: lang.referenceRemoveButtonTitle,
        replace_button_title: lang.referenceReplaceButtonTitle,
        reference_buttons_label: _.str.sformat(lang.referenceSearchButtonLabel,bo_type_name,ext_system_name),
        change_reference: bo_ref.get("change_reference")
      };
    },

    onRender: function() {
      var formData, formOptions, formSchema;
      if (this.options.actionContext.mode==="workspace_reference_create") {
        formData = this.options.actionContext.workspaceReference.get("data") || {};
        formOptions = this.options.actionContext.workspaceReference.get("options") || {};
        formSchema = this.options.actionContext.workspaceReference.get("schema") || {};
      }
      if (this.options.actionContext.mode==="workspace_reference_edit") {
        formData = {BOID:this.options.actionContext.workspaceReference.get("bo_id")};
        formOptions = {
          fields: {
            BOID:{}
          }
        };
        formSchema = {
          properties: {
            BOID:{
              readonly: true,
              required: false,
              title: lang.businessObjectIdLabel,
              type: "string"
            }
          }
        };
      }
      if (formData && formOptions && formSchema) {
        this.formModel = new Backbone.Model({data:formData,options:formOptions,schema:formSchema});
        this.metdataForm = new FormView({model: this.formModel, context: this.options.context});
        this.metadataRegion.show(this.metdataForm);
      }
    }
  });

  var ReferencePanelView = Marionette.LayoutView.extend({

    className: 'conws-reference reference-panel cs-form cs-form-create',

    template: template,

    regions: {
      initialRegion: '.conws-reference-initial',
      replaceRegion: '.conws-reference-replace'
    },

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegionBehavior
      }
    },

    constructor: function ReferencePanelView(options) {
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);

      // if reference panel is not destroyed, when closing the create dialog, we do it here.
      if (this.options.actionContext.referencePanelView) {
        this.options.actionContext.referencePanelView.destroy();
      }
      this.options.actionContext.referencePanelView = this;

      var viewContext, anchor;
      if (this.options.mode==="create") {
        this.options.actionContext.mode = "workspace_reference_create";
        viewContext = this.options.metadataView;
        var forms = options && options.fetchedModels,
            formCollection = forms && forms.formCollection,
            formOptions = formCollection && formCollection.options,
            addItemController = formOptions && formOptions.metadataAddItemController,
            dialog = addItemController && addItemController.dialog;
        // as agreed with csui team get dialog from controller and from there get the overlay area
        anchor = dialog && dialog.$(".binf-modal-content");
      } else if (this.options.mode==="update") {
        this.options.actionContext.mode = "workspace_reference_edit";
        if (this.options.metadataView && this.options.metadataView.options.metadataNavigationView) {
          viewContext = this.options.metadataView.options.metadataNavigationView;
        } else {
          viewContext = this.options.metadataView;
        }
          // SAPRM-9072. Removed .cs-perspective-panel from css selector. This panel is not available
          // in integration scenarios.
          anchor = ".cs-properties-wrapper>.cs-metadata";
      }
      if (viewContext!==this.options.actionContext.viewContext) {
        delete this.options.actionContext.boSearchModel;
        delete this.options.actionContext.boSearchDialogController;
        this.options.actionContext.viewContext = viewContext;
      }

      var bo_ref = this.options.actionContext.workspaceReference;
      if (!this.options.actionContext.boSearchModel) {
        this.options.actionContext.boSearchModel = new BoSearchModel({
          bo_type_id: bo_ref.get("bo_type_id"),
          bo_type_name: bo_ref.get("bo_type_name"),
          row_id: bo_ref.get("row_id")
        });
      } else {
        this.options.actionContext.boSearchModel.set({
          bo_type_id: bo_ref.get("bo_type_id"),
          bo_type_name: bo_ref.get("bo_type_name"),
          row_id: bo_ref.get("row_id")
        });
      }

      if (!this.options.actionContext.boSearchDialogController) {
        this.options.actionContext.boSearchDialogController = new BoSearchDialogController({
          mode: this.options.actionContext.mode,
          context: this.options.context,
          htmlPlace: anchor,
          boSearchModel: this.options.actionContext.boSearchModel,
          disableItemsWithWorkspace: true
        });
      } else {
        this.options.actionContext.boSearchDialogController.options.mode = this.options.actionContext.mode;
        this.options.actionContext.boSearchDialogController.options.htmlPlace = anchor;
      }

      this.listenTo(this.options.actionContext.boSearchModel, "boresult:select", this._replaceReference);
      this.listenTo(this.options.actionContext.boSearchModel, "bosearch:cancel", this._cancelSearch );
      this.listenTo(this.options.actionContext.boSearchModel, "change:bo_type_name", _.bind(function(){
        this.options.actionContext.workspaceReference.set("by_type_name",this.options.actionContext.boSearchModel.get("bo_type_name"));
        this.render();
      },this));

      this.listenTo(this.options.actionContext.workspaceReference, "error", function(model,response,options) {
        var errmsg = response && (new base.Error(response)).message || lang.errorUpdatingWorkspaceReference;
        log.error("Updating the workspace reference failed: {0}",errmsg) && console.error(log.last);
        ModalAlert.showError(errmsg);
      });

      this.listenTo(options.originatingView, "render:forms",this._formsRendered);
      if (this.options.actionContext.mode==="workspace_reference_create") {
        this.options.actionContext.scrollToPanel = true;
        this.options.actionContext.focusButton = true;
      }
    },

    onDestroy: function () {
      //console.log("ReferencePanelView destroy called ",this.cid);
      if (this===this.options.actionContext.referencePanelView) {
        delete this.options.actionContext.referencePanelView;
      }
    },

    templateHelpers: function () {
      return {
        title: lang.referenceTabTitle,
        override_note: lang.referencePanelOverrideNote,
        change_reference:this.options.actionContext.workspaceReference.get("change_reference")
      };
    },

    currentlyFocusedElement: function () {
      //console.log("currently focused element of",this.cid,"count",this.$el.find('button').length);
      //return this.$el.find('button');
      var el;
      if (this.options.actionContext.workspaceReference.get("bo_id")) {
        el = this.replaceView && this.replaceView.ui.replaceButton;
      } else {
        el = this.initialView && this.initialView.ui.searchButton;
      }
      if (el&&el.attr&&el.prop) {
        log.debug("currently focused element of {0} count {1} class {2}",this.cid,el?el.length:"no el",el.attr('class')) && console.log(log.last);
        return el;
      } else {
        return undefined;
      }
    },

    // The view is rendered whenever the model changes.
    onRender: function () {
      // LayoutView destroys views on rendering, so we must create them every time on rendering
      if (this.options.actionContext.workspaceReference.get("bo_id")) {
        delete this.initialView;
        this.replaceView = new ReferenceReplaceView(this.options);
        this.listenTo(this.replaceView, "referencetab:remove", this._removeReference);
        this.listenTo(this.replaceView, "referencetab:replace", this._triggerSearch);
        this.replaceRegion.show(this.replaceView);
      } else {
        delete this.replaceView;
        this.initialView = new ReferenceInitialView(this.options);
        this.listenTo(this.initialView, "referencetab:search", this._triggerSearch);
        this.initialRegion.show(this.initialView);
      }
    },

    _triggerSearch : function() {
      log.debug("trigger reference:search") && console.log(log.last);
      this.options.actionContext.boSearchModel.trigger("reference:search");
    },

    _removeReference : function() {
      log.debug("clear reference") && console.log(log.last);
      this._refetchForms({
        "data":undefined,
        "options":{},
        "schema":{},
        "bo_id":undefined,
        "row_id":undefined
      });
    },

    _cancelSearch : function() {
      this._focusButton({cancelSearch:true});
    },

    _replaceReference : function(selectEventInfo) {
      log.debug("set reference") && console.log(log.last);
      if (selectEventInfo && selectEventInfo.selectedItems
          && selectEventInfo.selectedItems.length>0
          && selectEventInfo.selectedItems[0]) {
        var selectedObject = selectEventInfo.selectedItems[0];
        var formData = {},
            formFields = {},
            formProperties = {},
            collection = selectedObject.collection,
            columnDefinitions =  collection.columns,
            tableColumns = collection.tableColumns,
            sortedColumns = tableColumns.toArray().sort(function(a,b){return a.get("sequence")-b.get("sequence");});
        _.each(sortedColumns,function(tc){
          var key = tc.get("key"),
              col = columnDefinitions.get(key),
              name = col.get("fieldName");
          formData[name] = selectedObject.get(key);
          formFields[name] = {
          };
          formProperties[name] = {
            readonly: true,
            required: false,
            title: col.get("fieldLabel"),
            type: "string"
          };
        });
        this._refetchForms({
          "data":formData,
          "options":{fields:formFields},
          "schema":{properties:formProperties},
          "bo_id":selectedObject.get("businessObjectId"),
          "row_id":selectedObject.get("id")
        }, "select");
      } else {
        this.render();
        this.options.actionContext.boSearchModel.trigger("reference:selected");
        this._scrollToPanel();
        this._focusButton();
      }
    },

    _getAllValues: function () {

      var data = {},
          metadataView = this.options && this.options.metadataView;
      if (metadataView) {
        data = {
          "name": metadataView.metadataHeaderView.getNameValue(),
          "type": metadataView.options.model.get('type'),
          "parent_id": metadataView.options.model.get('parent_id')
        };
        var formsValues = metadataView.metadataPropertiesView.getFormsValues();
        _.extend(data, formsValues);
      }

      return data;
    },

    _refetchForms: function(attributes,mode) {
      // and refetch all forms from server to get default values depending on bo_id
      var self = this,
          bo_ref = this.options.actionContext.workspaceReference,
          bo_id = attributes.bo_id,
          actionContext = this.options.actionContext,
          originatingView = this.options.originatingView,
          forms = this.options.fetchedModels;
      if (actionContext.mode==="workspace_reference_create") {
        var formCollection = forms.formCollection;
        if (bo_id) {
          formCollection.bo_type_id = bo_ref.get("bo_type_id");
          formCollection.bo_id = bo_id;
        } else {
          delete formCollection.bo_type_id;
          delete formCollection.bo_id;
        }
        formCollection.formsValues = this._getAllValues();
        formCollection.formsSchema = formCollection.serverForms;
        forms.fetch().then(function () {
              // on success, set attributes and options for actions after rendering
              bo_ref.set(attributes);
              if (mode === "select") {
                originatingView.once("render:forms", function () {
                  self.options.actionContext.boSearchModel.trigger("reference:selected");
                });
              }
              actionContext.scrollToPanel = true;
              actionContext.focusButton = true;
            },
            function () {
              //in case of error do not set attributes. bo_ref.set(attributes);
              if (mode === "select") {
                self.options.actionContext.boSearchModel.trigger("reference:rejected");
              }
            }
        );
      } else if (actionContext.mode==="workspace_reference_edit") {
        var bo_id_old = bo_ref.get("bo_id"),
            node = this.options.node;
        bo_ref.save({"bo_id":bo_id},{wait:true})
            .then(function() {
              node.fetch().then(function(){
                    forms.fetch().then(function(){
                          bo_ref.set(attributes);
                          if (mode==="select") {
                            originatingView.once("render:forms", function () {
                              self.options.actionContext.boSearchModel.trigger("reference:selected");
                            });
                          }
                          actionContext.scrollToPanel = true;
                          actionContext.focusButton = true;
                        },
                        function () {
                          //in case of error do not set attributes. bo_ref.set(attributes);
                          bo_ref.set("bo_id",bo_id_old);
                          if (mode==="select") {
                            self.options.actionContext.boSearchModel.trigger("reference:rejected");
                          }
                        });
                  },
                  function () {
                    //in case of error do not set attributes. bo_ref.set(attributes);
                    bo_ref.set("bo_id",bo_id_old);
                    if (mode==="select") {
                      self.options.actionContext.boSearchModel.trigger("reference:rejected");
                    }
                  });
            }, function() {
              // on error: restore to state before save
              bo_ref.set("bo_id",bo_id_old);
              if (mode==="select") {
                self.options.actionContext.boSearchModel.trigger("reference:rejected");
              }
            });
      } else {
        bo_ref.set(attributes);
        this.render();
        if (mode==="select") {
          self.options.actionContext.boSearchModel.trigger("reference:selected");
        }
        this._scrollToPanel();
        this._focusButton();
      }
    },

    // scroll panel to be visible
    _scrollToPanel: function() {
      var originatingView = this.options && this.options.originatingView,
          tabLinks = originatingView && originatingView.tabLinks;
      if (tabLinks) {
        var refLink;
        tabLinks.children.each(function (tabLink) {
          if (tabLink.model.id === "conws-reference") {
            refLink = tabLink;
          }
        });
        if (refLink) {
          refLink.activate();
        }
      }
    },

    // set focus on buttton, if desired
    _focusButton: function(eventOptions) {
      var metadataView = this.options && this.options.metadataView,
          headerView = metadataView && metadataView.metadataHeaderView,
          nameView = headerView && headerView.metadataItemNameView;
      if (!nameView || nameView.readonly || nameView.model && nameView.model.get("name") ||
          (eventOptions && eventOptions.cancelSearch)) {
        if (this.options.actionContext.workspaceReference.get("bo_id")) {
          var butn;
          if (this.replaceView) {
            butn = $(this.replaceView.ui.replaceButton);
            butn.focus();
          }
        } else {
          if (this.initialView) {
            butn = $(this.initialView.ui.searchButton);
            butn.focus();
          }
        }
        var originatingView = this.options.originatingView,
            href = originatingView.$el.find("div[id='conws-reference']");
        if (href && href.length > 0) {
          var hrefTop = href[0].offsetTop;
          if (butn && butn.length>0) {
            var butnTop = butn[0].offsetTop;
            var butnHeight = butn.height();
            var panelHeight = originatingView.tabContent.$el.height();
            // adjust only, if button is not visible anyway
            if (butnTop+butnHeight>hrefTop+panelHeight) {
              var extraTopOffset = Math.max(originatingView.getOption('extraScrollTopOffset')||0,5);
              var scrollTop = butnTop + butnHeight - panelHeight + extraTopOffset;
              // var curScrollTop = originatingView.tabContent.$el.scrollTop();
              // console.log("changing scrollTop from "+curScrollTop+" to "+scrollTop);
              originatingView.tabContent.$el.animate({scrollTop:scrollTop},300);
            }
          }
        }
      } else {
        nameView.setEditModeFocus();
      }
    },

    _formsRendered: function() {
      if (this.options.actionContext.scrollToPanel) {
        delete this.options.actionContext.scrollToPanel;
        this._scrollToPanel();
      }
      if (this.options.actionContext.focusButton) {
        delete this.options.actionContext.focusButton;
        this._focusButton();
      }
    },

    // This view is displayed also during the node creation;
    // because a form view is expected, this view implements a partial FormView interface too

    validate: function () {
      return true;
    },

    getValues: function () {
      // These values will be merged into the creational object posted
      // to the server; if the model has 'role_name' property defined,
      // the properties will be posted nested in that role

      return {
        bo_id: this.options.actionContext.workspaceReference.get("bo_id"),
        bo_type_id: this.options.actionContext.workspaceReference.get("bo_type_id")
      };
    },

    hideNotRequired: function(hide) {
      return true;
    }

  });

  return ReferencePanelView;

});

csui.define('xecmpf/widgets/boattachments/impl/boattachments.factory',['module', 'csui/lib/underscore',  'csui/lib/jquery', 'csui/lib/backbone',
    'csui/utils/contexts/factories/factory',
    'csui/utils/contexts/factories/node',
    'xecmpf/widgets/boattachments/impl/boattachments.model',
    'xecmpf/models/boattachmentcontext/attachmentcontext.busobjinfo.factory'

], function (module, _, $, Backbone,
             CollectionFactory,
             NodeModelFactory,
             BOAttachmentCollection,
             AttachmentContextBusinessObjectInfoFactory) {

    var BOAttachmentCollectionFactory = CollectionFactory.extend({

        propertyPrefix: 'boAttachments',

        constructor: function BOAttachmentCollectionFactory(context, options) {
            CollectionFactory.prototype.constructor.apply(this, arguments);

            var boAttachments = this.options.boAttachments || {};
            if (!(boAttachments instanceof Backbone.Collection)) {

                this.property = new BOAttachmentCollection(boAttachments.models, _.extend({
                    context: context,
                    node: context.getModel(NodeModelFactory, options),
                }, boAttachments.options, module.config().options, {
                    autoreset: true
                }, options));
            }
        },

        fetch: function (options) {
            return this.property.fetch(options);
        }

    });

    return BOAttachmentCollectionFactory;

});

csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/toolbaritems',[
    'module',
    "csui/controls/toolbar/toolitem.model",
    'csui/controls/toolbar/toolitems.factory',
    'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
    'i18n!csui/controls/tabletoolbar/impl/nls/localized.strings',
], function (module, ToolItemModel, ToolItemsFactory, lang, _lang) {

    var toolbarItems = {

        tableHeaderToolbar: new ToolItemsFactory({
                main: [
                    {signature: "Snapshot", name: lang.CommandSnapshot}
                ]
            },
            {
                maxItemsShown: 15,
                dropDownIcon: "icon icon-toolbar-more"
            })
    };

    return toolbarItems;

});

csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/boattachments.columns',["csui/lib/backbone",
    "i18n!xecmpf/widgets/boattachments/impl/nls/lang"], function (Backbone, lang) {

    var TableColumnModel = Backbone.Model.extend({

        defaults: {
            key: null,  // key from the resource definitions
            sequence: 0 // smaller number moves the column to the front
        }

    });

    var TableColumnCollection = Backbone.Collection.extend({

        model: TableColumnModel,
        comparator: "sequence",
        // modelId: "key",

        getColumnKeys: function () {
            return this.pluck('key');
        },

        deepClone: function () {
            return new TableColumnCollection(
                this.map(function (column) {
                    return column.attributes;
                }));
        }

    });

    // sequence:
    // 1-100: Fixed columns
    // 500-600: Dynamic columns (custom columns in widget configuration)
    // 900-1000: Special columns at the end (favorite, like, comment)
    // Hint: if the sequence of 'name' column is changed, the focused column in workspacestable.view
    // should be also adapted with the new id.
    // Current state is tableView.accFocusedState.body.column = 1

    var tableColumns = new TableColumnCollection([
        {
            key: 'type',
            permanentColumn: true,
            sequence: 10
        },
        {
            key: 'name',
            permanentColumn: true,
            sequence: 20
        },
        {
            key: 'parent_id',
            title: lang.parent_id,
            permanentColumn: true,
            sequence: 30
        },
        {
            key: 'reserved',
            sequence: 40,
            noTitleInHeader: true,
            permanentColumn: true,
        },
        {
            key: 'modify_date',
            permanentColumn: true,
            sequence: 50
        },
        {
            key: 'version',
            sequence: 60
        },
        {
            key: 'size',
            sequence: 70
        },
        {
            key: 'create_date',
            sequence: 80
        },
        {
            key: 'createdby',
            sequence: 90
        },
        {
            key: 'modifiedby',
            sequence: 100
        },
        {
            key: 'favorite',
            sequence: 910,
            noTitleInHeader: true, // don't display a column header
            permanentColumn: true // don't wrap column due to responsiveness into details row
        }
    ]);

    return tableColumns;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"xecmpf-boattachmentstable\">\r\n    <div id=\"botabletoolbar\" class=\"csui-rowselection-toolbar\"></div>\r\n    <div id=\"botableview\"></div>\r\n    <div id=\"bopaginationview\"></div>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_widgets_boattachments_impl_boattachment.table_boattachmentstable', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable',[],function(){});
csui.define('xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone', 'csui/lib/marionette', 'csui/utils/base',
    'csui/behaviors/default.action/default.action.behavior',
    'csui/behaviors/table.rowselection.toolbar/table.rowselection.toolbar.behavior',
    'csui/utils/contexts/factories/connector',
    'csui/controls/table/table.view', 'csui/controls/pagination/nodespagination.view',
    'csui/dialogs/modal.alert/modal.alert',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/utils/commands', 'csui/controls/table/rows/description/description.view',
    'xecmpf/widgets/boattachments/impl/boattachment.table/toolbaritems',
    'xecmpf/widgets/boattachments/impl/boattachment.table/boattachments.columns',
    'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
    'hbs!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable',
    'css!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable'
], function (module, $, _, Backbone, Marionette, base,
    DefaultActionBehavior, TableRowSelectionToolbarBehavior,
    ConnectorFactory,
    TableView, PaginationView,
    ModalAlert,
    LayoutViewEventsPropagationMixin,
    commands, DetailsRowView,
    toolbarItems,
    AttachmentsColumns,
    lang, template) {

    var config = module.config();

    _.defaults(config, {
        defaultPageSize: 30,
        orderBy: {
            sortColumn: '{name}',
            sortOrder: 'asc'
        }
    });

    var BOAttachmentTableView = Marionette.LayoutView.extend({

        className: 'xecmpf-boattachments-table',

        template: template,

        regions: {
            toolbarRegion: '.csui-rowselection-toolbar',
            tableRegion: '#botableview',
            paginationRegion: '#bopaginationview'
        },

        behaviors: {
            DefaultAction: {
                behaviorClass: DefaultActionBehavior
            },
            TableRowSelectionToolbar: {
                behaviorClass: TableRowSelectionToolbarBehavior
            }
        },

        constructor: function BOAttachmentTableView(options) {
            options || (options = {});

            _.defaults(options, {
                data: {},
                pageSize: config.defaultPageSize,
                // toolbarItems and toolbarItemsMasks are required by TableRowSelectionToolbarBehavior
                toolbarItems: toolbarItems,
                toolbarItemsMasks: {
                    toolbars: {}
                }
            });

            _.defaults(options.data, {
                pageSize: config.defaultPageSize,
                orderBy: config.orderBy
            });

            this.context = options.context;
            this.collection = options.collection;

            Marionette.LayoutView.prototype.constructor.apply(this, arguments);
            this.propagateEventsToRegions();
        },

        initialize: function (options) {
            this.setTableView();
            this.setPagination();

            if (options.collection) {
                this.collection.fetched = false;
            }
        },

        setTableView: function () {
            this.columns = this.collection.columns;
            this.connector = (this.collection.node && this.collection.node.connector) ||
                this.context.getObject(ConnectorFactory);

            // For all columns where sort is true, search must be possible
            var columnsWithSearch = [''];
            _.each(this.columns.models, function (model) {
                // Enable sorting only for string types (e.g. StringField, StringMultiLine, StringPopup)
                // This is required for now, since server does not support other types
                if (model.get('sort') === true && model.get('type') === -1) {
                    columnsWithSearch.push(model.get('column_key'));
                }
            });

            // Add custom columns from widget configuration to displayed columns
            // Don't change WorkspacesColumns!
            var tableColumns = AttachmentsColumns.clone();

            this.tableView = new TableView({
                context: this.options.context,
                haveDetailsRowExpandCollapseColumn: true,
                descriptionRowView: DetailsRowView,
                descriptionRowViewOptions: {
                    firstColumnIndex: 2,
                    lastColumnIndex: 2,
                    showDescriptions: true,
                    collapsedHeightIsOneLine: true
                },
                connector: this.connector,
                collection: this.collection,
                columns: this.columns,
                tableColumns: tableColumns,
                columnsWithSearch: columnsWithSearch,
                selectColumn: true,
                pageSize: this.options.data.pageSize,
                orderBy: this.collection.options.boAttachments.attributes.sortExpanded || this.collection.orderBy,
                nameEdit: false,
                tableTexts: {
                    zeroRecords: lang.noAttachmentsFound
                },
                maxColumnsDisplayed: 10
            });

            this.listenTo(this.tableView, 'execute:defaultAction', function (node) {
                var args = {
                    node: node
                };
                this.trigger('before:defaultAction', args);
                if (!args.cancel) {
                    this.defaultActionController.executeAction(node, {
                        context: this.options.context,
                        originatingView: this
                    }).done(function () {
                        this.trigger('executed:defaultAction', args);
                    }.bind(this));
                }
            });
        },

        setPagination: function () {
            this.paginationView = new PaginationView({
                collection: this.collection,
                pageSize: this.options.data.pageSize
            });
        },

        onRender: function () {
            this.collection.fetch({
                reload: true
            });
            this.tableRegion.show(this.tableView);
            this.paginationRegion.show(this.paginationView);
        },

        onBeforeShow: function () {
            // place overlay
            var parent = this._parent;
            while (!parent.headerView) {
                parent = parent._parent;
            }
            this._renderTitleIconWaterMark(parent);
        },

        _renderTitleIconWaterMark: function (dialogView) {
            var titleImgEl = dialogView.headerView &&
                dialogView.headerView.$el.find('.tile-type-image img')[0];
            if (titleImgEl) {
                $(titleImgEl).after('<span class="csui-icon xecmpf-icon-boattachment-overlay" ' +
                    'title="' + lang.businessAttachments + '"></span>');
            }
        }
    });

    _.extend(BOAttachmentTableView.prototype, LayoutViewEventsPropagationMixin);

    return BOAttachmentTableView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/boattachments/impl/boattitem',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-value\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.title : depth0)) != null ? stack1.value : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.reserved_by : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.reserved_by_other : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "                  <span class=\"csui-icon icon-reserved_self\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.reserved_by || (depth0 != null ? depth0.reserved_by : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"reserved_by","hash":{}}) : helper)))
    + "\"></span>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "                  <span class=\"csui-icon icon-reserved_other\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.reserved_by_other || (depth0 != null ? depth0.reserved_by_other : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"reserved_by_other","hash":{}}) : helper)))
    + "\"></span>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <span class=\"xecmpf-label\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.title : depth0)) != null ? stack1.label : stack1), depth0))
    + "</span>\r\n";
},"8":function(depth0,helpers,partials,data) {
    return "            <!-- add element to get proper distance to description -->\r\n            <div class=\"xecmpf-description-spacer\"></div>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"xecmpf-right\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.topRight : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.topRight : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "          </div>\r\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-value\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.topRight : depth0)) != null ? stack1.value : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.topRight : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"12":function(depth0,helpers,partials,data) {
    return "                <!-- add element to get proper distance to value -->\r\n                <div class=\"xecmpf-spacer\"></div>\r\n";
},"14":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-label\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.topRight : depth0)) != null ? stack1.label : stack1), depth0))
    + "</span>\r\n";
},"16":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"xecmpf-body\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.description : depth0)) != null ? stack1.value : stack1), depth0))
    + "</div>\r\n";
},"18":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"xecmpf-left\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomLeft : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":this.program(19, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomLeft : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "          </div>\r\n";
},"19":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-label\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.bottomLeft : depth0)) != null ? stack1.label : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomLeft : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"21":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-value\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.bottomLeft : depth0)) != null ? stack1.value : stack1), depth0))
    + "</span>\r\n";
},"23":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"xecmpf-right\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomRight : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":this.program(24, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomRight : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(26, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "          </div>\r\n";
},"24":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-label\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.bottomRight : depth0)) != null ? stack1.label : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.bottomRight : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"26":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <span class=\"xecmpf-value\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.bottomRight : depth0)) != null ? stack1.value : stack1), depth0))
    + "</span>\r\n";
},"28":function(depth0,helpers,partials,data) {
    return "  <div class=\"xecmpf-attachmentitem-divider\"></div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"xecmpf-attachmentitem-action-area\">\r\n  <a class=\"xecmpf-nostyle\" href=\""
    + this.escapeExpression(((helper = (helper = helpers.defaultActionUrl || (depth0 != null ? depth0.defaultActionUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"defaultActionUrl","hash":{}}) : helper)))
    + "\">\r\n    <div class=\"xecmpf-attachmentitem-border\">\r\n        <div class=\"xecmpf-attachmentitem-top\">\r\n            <span class=\"csui-type-icon "
    + this.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"icon","hash":{}}) : helper)))
    + "\" aria-hidden=\"true\"></span>\r\n            <div class=\"xecmpf-title xecmpf-left\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.title : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.title : depth0)) != null ? stack1.label : stack1),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.description : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "        </div>\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.topRight : depth0),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "      </div>\r\n\r\n      <div class=\"xecmpf-attachmentitem-center\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.description : depth0)) != null ? stack1.value : stack1),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "      </div>\r\n\r\n      <div class=\"xecmpf-attachmentitem-bottom\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.bottomLeft : depth0),{"name":"if","hash":{},"fn":this.program(18, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.bottomRight : depth0),{"name":"if","hash":{},"fn":this.program(23, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n  </a>\r\n</div>\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.notLastItem : depth0),{"name":"if","hash":{},"fn":this.program(28, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_boattachments_impl_boattitem', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/boattachments/impl/boattitem',[],function(){});
// Shows a list of workspaces related to the current one
csui.define('xecmpf/widgets/boattachments/impl/boattitem.view',['module', 'csui/lib/underscore',
    'csui/lib/marionette',
    'csui/lib/jquery',
    'csui/behaviors/default.action/default.action.behavior',
    'csui/utils/base',
    'csui/lib/numeral',
    'csui/utils/contexts/factories/user',
    'xecmpf/widgets/boattachments/impl/boattachmentutil',
    'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
    'hbs!xecmpf/widgets/boattachments/impl/boattitem',
    'css!xecmpf/widgets/boattachments/impl/boattitem'
], function (module, _, Marionette, $,
             DefaultActionBehavior,
             base,
             numeral,
             UserModelFactory,
             BOAttachmentUtil,
             lang,
             itemTemplate) {

    var AttachmentItemView = Marionette.ItemView.extend({

        behaviors: {
            DefaultAction: {
                behaviorClass: DefaultActionBehavior
            }
        },

        constructor: function AttachmentItemView(options) {
            Marionette.ItemView.prototype.constructor.apply(this, arguments);
            this.user = this.options.context.getModel(UserModelFactory);
        },

        triggers: {
            'click .xecmpf-attachmentitem-border': 'click:item'
        },

        onClickItem: function () {
            this.triggerMethod('execute:defaultAction', this.model);
        },

        className: 'xecmpf-attachmentitem-object clearfix',
        template: itemTemplate,
        _checkValue: function(obj) {
            return (!_.isUndefined(obj.value) && !_.isNull(obj.value)?true:false)
        },
        _convValueToString: function(obj) {
            !_.isString(obj.value) && (obj.value = obj.value+"");
            return obj;
        },
        serializeData: function () {
            var allval = this._getObject(this.options.data || {});

            // prepare values
            var values = {};

            // take only values we want
            allval.title && (values.title = allval.title);
            allval.description && (values.description = allval.description);
            allval.topRight && this._checkValue(allval.topRight) && (values.topRight = this._convValueToString(allval.topRight));
            allval.bottomLeft && this._checkValue(allval.bottomLeft) && (values.bottomLeft = this._convValueToString(allval.bottomLeft));
            allval.bottomRight && this._checkValue(allval.bottomRight) && (values.bottomRight = this._convValueToString(allval.bottomRight));

            // default values if still no value is set
            values.title || (values.title = {value: this.model.get('name')});
            values.name || (values.name = this.model.get('name'));
            values.id || (values.id = this.model.get('id'));
            values.defaultActionUrl = DefaultActionBehavior.getDefaultActionNodeUrl(this.model);

            // provide property to indicate that this is not the last item
            if (this.model.get("id") !==
                this.model.collection.models[this.model.collection.models.length - 1].get("id")) {
                values.notLastItem = true;
            }

            if (this.model.get("reserved_user_id")) {
                var reservedBy = lang.reservedBy.replace("%1", this.model.get("reserved_user_id_expand").name_formatted);
                if (this.user.get("id")  === this.model.get("reserved_user_id")) {
                    values.reserved_by = reservedBy;
                } else {
                    values.reserved_by_other = reservedBy;
                }
            }

            return values;
        },

        templateHelpers: function (data) {
            return data;
        },

        // Loop over configuration and set proper content that should be displayed
        _getObject: function (object) {
            return _.reduce(object, function (result, expression, name) {
                if (typeof expression !== 'object') {
                    expression = this.self._getValue(expression);
                } else if (typeof expression === 'object') {
                    if (name === 'value' || name === 'label') {
                        var exp = base.getClosestLocalizedString(expression);
                        expression = this.self._getValue(exp);
                    }
                    else {
                        expression = this.self._getObject(expression);
                    }
                }
                result[name] = expression;

                return result;
            }, {}, {"self": this});
        },

        _getValue: function (expression) {
            // Replace the {} parameter placeholders
            var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g,
                match, propertyName, placeholder, value, valueFormat, result = expression;
            // Go over every parameter placeholder found
            // Don't change expression while doing this, because exec remembers position of last matches
            while ((match = parameterPlaceholder.exec(expression))) {
                placeholder = match[0];
                propertyName = match[1];
                valueFormat = match[3];
                // Format the value according to his type
                if (this.model.collection.columns.models) {
                    value = this._formatPlaceholder(propertyName, valueFormat, this.model.attributes,
                        this.model.collection.columns.models);
                }

                // Replace the placeholder with the value found
                result = result.replace(placeholder, value);
            }
            return result;
        },

        // returns a type specifically formatted model value.
        _formatPlaceholder: function (propertyName, valueFormat, attributes, columnModels) {
            var value, column, type, suffix = "_expand", orgPropertyName = propertyName;

            column = _.find(columnModels, function (obj) {
                return obj.get("column_key") === propertyName;
            });
            type = column && column.get("type") || undefined;

            // If exist use expanded property
            propertyName = attributes[propertyName + suffix] ? propertyName + suffix : propertyName;
            value = !_.isUndefined(attributes[propertyName])?attributes[propertyName]: "";

            switch (type) {
                case -7:
                    if (propertyName === 'modify_date' || propertyName === 'modified' ) {
                        value = attributes['modified'] || attributes['modify_date'];
                    }
                    value = base.formatDate(value);
                    break;
                case 5:
                    // Type 5 is a boolean and in this case format properly
                    value = attributes[propertyName + "_formatted"];
                    if (value === null || value === undefined) {
                        value = '';
                    }
                    break;
                case 2:
                case 14:
                    if (propertyName === 'size' || propertyName === 'modifiedby' || propertyName === 'createdby') {
                        value = attributes[propertyName + '_formatted'];
                    }
                    else if (propertyName.indexOf(suffix, this.length - suffix.length) !== -1 &&
                        (attributes[propertyName].type_name === "User" || attributes[propertyName].type_name === "Group")) {
                        value = base.formatMemberName(value);
                    }
                // No break because it must also be checked for default!
                /* falls through */
                default:
                    // Allow currency to applied for different types, e.g. also a string can be
                    // formatted as currency
                    if (valueFormat === 'currency') {
                        // FIXME: format properly if csui provide formating currencies, for now use default
                        value = numeral(value).format();
                    }

                    // In case the value is still expanded object (e.g. user property is undefined, ...)
                    // Set value the not expanded property
                    if (typeof value === 'object') {
                        value = attributes[orgPropertyName] || "";
                    }
            }
            return value;
        }
    });

    return AttachmentItemView;

});

/**
 * Created by giddamr on 3/23/2018.
 */
csui.define('xecmpf/widgets/boattachments/impl/headertoolbaritems',[
  'csui/controls/toolbar/toolitems.factory',
  'i18n!xecmpf/widgets/boattachments/impl/nls/lang'
], function (ToolItemsFactory, lang) {

  var headerToolbarItems = {
    AddToolbar: new ToolItemsFactory({
          main: [
            {
              signature: "BOAttachmentsCreate",
              name: lang.addBusinessAttachment,
              icon: "icon icon-toolbarAdd"
            }
          ]
        },
        {
          maxItemsShown: 1,
          dropDownIcon: "icon icon-toolbar-more"
        })
  };

  return headerToolbarItems;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/dialogheader/impl/dialogheader',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "  <div class=\"cs-close\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.dialogCloseButtonTooltip || (depth0 != null ? depth0.dialogCloseButtonTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"dialogCloseButtonTooltip","hash":{}}) : helper)))
    + "\">\r\n    <div class=\"icon circular "
    + this.escapeExpression(((helper = (helper = helpers.iconRight || (depth0 != null ? depth0.iconRight : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"iconRight","hash":{}}) : helper)))
    + "\" tabindex=\"0\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.ariaDialogClose || (depth0 != null ? depth0.ariaDialogClose : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"ariaDialogClose","hash":{}}) : helper)))
    + "\"\r\n         role=\"button\"></div>\r\n  </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"left-section\"></div>\r\n<div class=\"center-section\"></div>\r\n<div class=\"right-section\"></div>\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hideDialogClose : depth0),{"name":"if","hash":{},"fn":this.noop,"inverse":this.program(1, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_controls_dialogheader_impl_dialogheader', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/controls/dialogheader/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/controls/dialogheader/impl/nls/root/lang',{
  dialogCloseButtonTooltip: 'Close',
  ariaDialogClose: 'Close dialog'
});



csui.define('css!xecmpf/controls/dialogheader/impl/dialogheader',[],function(){});
csui.define('xecmpf/controls/dialogheader/dialogheader.view',[
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/backbone',
  'csui/lib/marionette',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'hbs!xecmpf/controls/dialogheader/impl/dialogheader',
  'i18n!xecmpf/controls/dialogheader/impl/nls/lang',
  'css!xecmpf/controls/dialogheader/impl/dialogheader'
], function (_, $, Backbone, Marionette, TabableRegion, template, lang) {

  var DialogHeaderView = Marionette.LayoutView.extend({

    className: 'xecmpf-header',
    template: template,

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegion
      }
    },

    regions: {
      LeftRegion: '.left-section',
      CenterRegion: '.center-section',
      RightRegion: '.right-section'
    },

    events: {
      'keydown': 'onKeyInView'
    },

    templateHelpers: function () {
      return {
        iconRight: !!this.options.iconRight ? this.options.iconRight : 'cs-icon-cross',
        dialogCloseButtonTooltip: lang.dialogCloseButtonTooltip,
        ariaDialogClose: lang.ariaDialogClose,
        hideDialogClose: this.options.hideDialogClose ? this.options.hideDialogClose : false
      };
    },

    constructor: function DialogHeaderView(options) {
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
    },

    onRender: function (){
      var leftView = this.options.leftView,
          centerView = this.options.centerView,
          rightView = this.options.rightView;

      if (leftView) {
        this.LeftRegion.show(leftView);
      }

      if (centerView) {
        this.CenterRegion.show(centerView);
      }

      if (rightView) {
        this.RightRegion.show(rightView);
      }
    },

    isTabable: function () {
      return this.$('*[tabindex]').length > 0;
    },

    currentlyFocusedElement: function (event) {
      var tabElements = this.$('*[tabindex]');
      if (tabElements.length) {
        tabElements.prop('tabindex', 0);
      }
      if (!!event && event.shiftKey) {
        return $(tabElements[tabElements.length - 1]);
      } else {
        return $(tabElements[0]);
      }
    },

    onLastTabElement: function (shiftTab, event) {
      // return true if focus is on last tabable element else false.
      return (shiftTab && event.target === this.$('*[tabindex]')[0]);
    },

    onKeyInView: function (event) {
      var keyCode = event.keyCode;

      //Enter/space
      if (keyCode === 13 || keyCode === 32) {
        $(event.target).click();
      }
    }

  });

  return DialogHeaderView;

});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/headertoolbar/impl/headertoolbar',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"filter-toolbar\"></div>\r\n<div class=\"add-toolbar\"></div>\r\n<div class=\"other-toolbar\"></div>";
}});
Handlebars.registerPartial('xecmpf_controls_headertoolbar_impl_headertoolbar', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/headertoolbar/impl/headertoolbar',[],function(){});
csui.define('xecmpf/controls/headertoolbar/headertoolbar.view',[
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/backbone',
  'csui/lib/marionette',
  'csui/controls/toolbar/toolitems.filtered.model',
  'csui/controls/toolbar/toolbar.view',
  'csui/controls/toolbar/toolbar.command.controller',
  'hbs!xecmpf/controls/headertoolbar/impl/headertoolbar',
  'css!xecmpf/controls/headertoolbar/impl/headertoolbar'
], function (_, $, Backbone, Marionette, FilteredToolItemsCollection, ToolbarView,
    ToolbarCommandController, template) {

  var HeaderToolbarView = Marionette.LayoutView.extend({
    className: 'xecmpf-header-toolbar',

    template: template,

    regions: {
      FilterToolbarRegion: '.filter-toolbar',
      AddToolbarRegion: '.add-toolbar',
      OtherToolbarRegion: '.other-toolbar'
    },

    constructor: function HeaderToolbarView(options) {
      this.commands = options.commands;
      this.commandController = options.commandController ? options.commandController :
                               new ToolbarCommandController({
                                 commands: this.commands
                               });
      this.originatingView = options.originatingView ? options.originatingView : this;

      this.context = options.context;
      this.nodes = options.selectedNodes;
      this.container = options.container;
      this.collection = options.collection;
      this.addableTypes = options.addableTypes;

      this.toolbarNames = ['Filter', 'Add', 'Other'];
      this.toolbarItems = options.toolbarItems || [];

      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
    },

    initialize: function (options) {
      var status = {
        context: this.context,
        nodes: this.selectedNodes,
        container: this.container,
        collection: this.collection,
        originatingView: this.originatingView,
        data: {
          addableTypes: this.addableTypes
        }
      };

      _.each(this.toolbarNames, function (toolbarName) {
        var fullToolbarName = toolbarName + 'Toolbar',
            toolItemFactory = this.toolbarItems[fullToolbarName];

        // create toolbar only if toolbar items (toolItemFactory) is defined
        if (toolItemFactory) {
          _.any(toolItemFactory.collection.models, function (model) {
            if (model.attributes.signature === 'disabled') {
              toolItemFactory.collection.remove(model);
              return true;
            }
          });

          var filteredCollection = new FilteredToolItemsCollection(
              toolItemFactory, {
                status: status,
                commands: this.commandController.commands
              });

          // create toolbar view
          var toolbarView = new ToolbarView(_.extend({
            collection: filteredCollection,
            toolbarName: toolbarName,
            originatingView: this.originatingView
          }, toolItemFactory.options));
          this[toolbarName + 'ToolbarView'] = toolbarView;

          // attach event listener for clicked toolbar items
          this.listenTo(toolbarView, 'childview:toolitem:action',
              this._toolbarItemClicked);
        }
      }, this);

    },

    onRender: function () {
      // call show on each toolbar region with the associated view
      _.each(this.toolbarNames, function (toolbarName) {
        // call show of view in region if view is instantiated
        if (this[toolbarName + 'ToolbarView']) {
          this[toolbarName + 'ToolbarRegion'].show(this[toolbarName + 'ToolbarView']);
        }
      }, this);
    },

    // This method is triggered as a nested 'childview:...' event; such
    // events always get the childView as the first argument.
    _toolbarItemClicked: function (toolItemView, args) {
      this.options.toolItemView = toolItemView;
      this.commandController.toolitemClicked(args.toolItem, this.options);
    }

  });

  return HeaderToolbarView;

});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/title/impl/title',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "  <div class=\"tile-type-icon\">\r\n    <span class=\"icon title-icon "
    + this.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"icon","hash":{}}) : helper)))
    + "\" aria-hidden=\"true\"></span>\r\n  </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.imageUrl : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "    <div class=\"tile-type-image "
    + this.escapeExpression(((helper = (helper = helpers.imageClass || (depth0 != null ? depth0.imageClass : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"imageClass","hash":{}}) : helper)))
    + "\">\r\n      <span class=\"tile-type-icon tile-type-icon-img\">\r\n        <img src=\""
    + this.escapeExpression(((helper = (helper = helpers.imageUrl || (depth0 != null ? depth0.imageUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"imageUrl","hash":{}}) : helper)))
    + "\" alt=\"\" aria-hidden=\"true\">\r\n      </span>\r\n    </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0)})) != null ? stack1 : "")
    + "\r\n<div class=\"title-name\">\r\n  <h4 class=\"title-name-block\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "\">"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "</h4>\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_title_impl_title', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/title/impl/title',[],function(){});
csui.define('xecmpf/controls/title/title.view',[
  'csui/lib/underscore', 'csui/lib/jquery',
  'csui/lib/backbone', 'csui/lib/marionette',
  'hbs!xecmpf/controls/title/impl/title',
  'css!xecmpf/controls/title/impl/title'
], function (_, $, Backbone, Marionette, template) {

  var TitleView = Marionette.ItemView.extend({

    className: 'title-wrapper',
    template: template,

    templateHelpers: function () {
      return {
        icon: this.options.icon,
        imageUrl: this.options.imageUrl,
        imageClass: this.options.imageClass,
        title: this.options.title
      }
    },

    constructor: function TitleView() {
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    }

  });

  return TitleView;

});



csui.define('css!xecmpf/widgets/boattachments/impl/boattachments',[],function(){});
/**
 * The business attachment view shows a list of documents linked to a business object
 * Provides:
 *   - infinite scrolling
 *   - Empty view in case no business attachments to show
 *   - Title icon
 */
csui.define('xecmpf/widgets/boattachments/boattachments.view',['csui/lib/marionette', 'module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/lib/jquery',
  'csui/utils/base',
  'csui/controls/list/list.view',
  'csui/utils/nodesprites',
  'csui/behaviors/limiting/limiting.behavior',
  'csui/behaviors/expanding/expanding.behavior',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'csui/controls/list/behaviors/list.view.keyboard.behavior',
  'csui/controls/tile/behaviors/infinite.scrolling.behavior',
  'csui/utils/contexts/factories/node',
  'csui/controls/progressblocker/blocker',
  'csui/dialogs/modal.alert/modal.alert',
  'csui/utils/log',
  'csui/controls/node-type.icon/node-type.icon.view',
  'csui/utils/commands',

  'xecmpf/widgets/boattachments/impl/boattachments.factory',
  'xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable.view',
  'xecmpf/widgets/boattachments/impl/boattitem.view',
  'xecmpf/models/boattachmentcontext/attachmentcontext.factory',
  'xecmpf/widgets/boattachments/impl/boattachmentutil',
  'csui/utils/nodesprites',
  'xecmpf/models/boattachmentcontext/attachmentcontext.busobjinfo.factory',
  'xecmpf/widgets/boattachments/impl/headertoolbaritems',
  'xecmpf/controls/dialogheader/dialogheader.view',
  'xecmpf/controls/headertoolbar/headertoolbar.view',
  'xecmpf/controls/title/title.view',

  'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
  'css!xecmpf/widgets/boattachments/impl/boattachments'
], function (Marionette, module, _, Backbone, $, base, ListView, NodeSpriteCollection,
  LimitingBehavior, ExpandingBehavior, TabableRegionBehavior, ListViewKeyboardBehavior,
  InfiniteScrollingBehavior, NodeModelFactory, BlockingView,
  ModalAlert,
  log,
  NodeTypeIconView,
  Commands,
  BusinessAttachmentsCollectionFactory,
  BusinessAttachmentsTableView,
  AttachmentItemView,
  AttachmentContextFactory,
  attachmentUtil,
  NodeSprites,
  BusinessObjectInfoFacory,
  HeaderToolbarItems,
  HeaderView,
  HeaderToolbarView,
  TitleView,
  lang, css) {

  var config = module.config();

  var BOAttachmentsView = ListView.extend({

    constructor: function BOAttachmentsView(options) {
      this.viewClassName = 'xecmpf-businessattachments';
      if (!options || !options.context) {
        throw new Error('Context required to create AttachmentsView');
      }

      // get business attachment context => triggers fetchg from outside
      if (!options.businessAttachmentContext) {
        options.businessAttachmentContext = options.context.getObject(AttachmentContextFactory,
          options.data);
        options.businessAttachmentContext.setAttachmentSpecific(
          BusinessAttachmentsCollectionFactory);
      }

      options.data || (options.data = {});
      options.data.businessattachment || (options.data.businessattachment = {});
      _.defaults(options.data.businessattachment.properties, {
        busObjectId: "",
        busObjectType: "",
        extSystemId: ""
      });
      // business object info returns icon info
      this.busobjinfo = options.businessAttachmentContext.getModel(BusinessObjectInfoFacory, {
        data: options.data.businessattachment.properties,
        attributes: options.data.businessattachment.properties
      });

      ListView.prototype.constructor.apply(this, arguments);

      if (this.options.blockingParentView) {
        BlockingView.delegate(this, this.options.blockingParentView);
      } else {
        BlockingView.imbue(this);
      }

      this.options.data.pageSize = config.defaultPageSize || 30;

      this.configOptionsData = _.clone(options.data);

      // Prepare server side filter
      this.lastFilterValue = "";

      // Per default show expand icon if more than 0 attachments are displayed
      this.limit = 0;

      // Render attachment icon
      this.listenTo(this.collection, "sync", this._renderBusinessAttachmentTitleIcon);
      // show default workspace icon
      this.listenTo(this.collection, "error", this._renderBusinessAttachmentTitleIcon);

      // Node model changed
      this.nodeModel = this.getContext().getObject(NodeModelFactory, options.context.options);
      this.listenTo(this.nodeModel, 'change:id', this._reset);

      // Note on this.messageOnError
      // Display general or error specific message

      // Loading animation
      this.listenTo(this.collection, "request", this.blockActions)
        .listenTo(this.collection, "sync", function () {
          this.messageOnError = undefined;
          this.unblockActions.apply(this, arguments);
        })
        .listenTo(this.collection, "destroy", this.unblockActions)
        .listenTo(this.collection, "error", function () {
          this.unblockActions.apply(this, arguments);
          if (this.messageOnError) {
            ModalAlert.showError(this.messageOnError);
            this.messageOnError = undefined;
          } else {
            ModalAlert.showError(arguments[1].responseJSON.error);
          }
        });
      // No empty view in case of loading animation
      this.listenTo(this.collection, "request", this.destroyEmptyView)
      // order By column configuration => object with column and order
      if (this.options &&
        this.options.data &&
        this.options.data.collapsedView &&
        this.options.data.collapsedView.orderBy) {

        if (_.isString(this.options.data.collapsedView.orderBy)) {
          log.error(lang.errorOrderByMustNotBeString) && console.log(log.last);
          ModalAlert.showError(lang.errorOrderByMustNotBeString);
        } else if (this.options.data.collapsedView.orderBy.sortColumn) {
          // check sort column format
          var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g;
          var match = parameterPlaceholder.exec(this.options.data.collapsedView.orderBy.sortColumn);
          if (!match) {
            log.error(lang.errorOrderByMissingBraces) && console.log(log.last);
            ModalAlert.showError(lang.errorOrderByMissingBraces);
          }
        }
      }
      // metadata field configuration
      if (this.options &&
        this.options.data &&
        this.options.data.collapsedView) {
        var errors = [],
          that = this;
        ["title", "description", "topRight", "bottomLeft", "bottomRight"].forEach(function (n) {
          if (that.options.data.collapsedView[n] && that.options.data.collapsedView[n].format) {
            errors.push(n);
          }
        });
        // should not happen
        if (errors.length > 0) {
          ModalAlert.showError(
            _.str.sformat(lang.errorFieldFormatTagUnrecognized, errors.join(", ")));
        }
      }

    },

    getContext: function () {
      return this.options.businessAttachmentContext;
    },

    initialize: function () {
      // Limiting behaviour needs complete collection, but other behaviours expect collection ...
      this.collection = this.completeCollection;
    },

    onRender: function () {
      // Load initially only one page
      this._resetInfiniteScrolling();
      ListView.prototype.onRender.call(this);
    },

    onClickHeader: function (target) {
      this.triggerMethod('expand');
    },

    _resetInfiniteScrolling: function () {
      // reset infinite scrolling in case filter is changed
      this.collection.setLimit(0, this.options.data.pageSize, false);
    },

    templateHelpers: function () {
      return {
        title: this._getTitle(),
        imageUrl: this._getTitleIcon().src,
        imageClass: 'xecmpf-attachmentstitleicon',
        searchPlaceholder: this._getSearchPlaceholder()
      };
    },

    childEvents: {
      'render': 'onRenderItem',
      'before:destroy': 'onBeforeDestroyItem'
    },

    className: function () {
      var className = this.viewClassName,
        parentClassName = _.result(ListView.prototype, 'className');
      if (parentClassName) {
        className = className + ' ' + parentClassName;
      }
      return className;
    },

    /**
     * Reset the current model/query and filter
     * Needed that it's not reused in in case widget is accessed again
     * on same perspective but with different node.
     *
     * @private
     */
    _reset: function () {
      // reset paging due to infinite scrolling
      // Page have to be reset in case wiget is accessed again
      if (this.collection) {
        this.collection.resetLimit();
      }

      // Reset filter
      if (this.ui.searchInput && this.ui.searchInput.val() !== "") {
        if (this.collection) {
          this.collection.clearFilter(false);
        }
        this.ui.searchInput.val('');
      }

      // Call search clicked if search is visible, this will cause the search box to slide out
      if (this.ui.searchInput && this.ui.searchInput.is(':visible')) {
        this.searchClicked(new CustomEvent(''));
      }
    },
    dialogClassName: 'xecmpf-businessattachments',
    behaviors: {

      // Limits the rendered collection length with a More link to expand it
      LimitedList: {
        behaviorClass: LimitingBehavior,
        // Show expand if more than 0 attachments are displayed
        limit: function () {
          return this.limit;
        },
        completeCollection: function () {
          return this.getContext().getCollection(BusinessAttachmentsCollectionFactory, {
            attributes: this._getCollectionAttributes(),
            options: {
              data: this.options.data,
              query: this._getCollectionUrlQuery()
            }
          })

        }
      },

      ExpandableList: {
        behaviorClass: ExpandingBehavior,
        expandedView: BusinessAttachmentsTableView,
        expandedViewOptions: function () {
          return {
            titleBarIcon: this._getTitleIcon(),
            data: _.clone(this.configOptionsData),
            commands: Commands,
            collection: this._getExpandedViewCollection(true) //for expand view new collection is required always for default filters & sorting.
          };
        },
        dialogClassName: function () {
          return this.dialogClassName;
        },
        headerView: function () {
          return this._getHeaderView();
        }
      },

      InfiniteScrolling: {
        behaviorClass: InfiniteScrollingBehavior,
        // selector for scrollable area
        content: '.binf-list-group',
        contentParent: '.tile-content',
        fetchMoreItemsThreshold: 80
      },

      TabableRegion: {
        behaviorClass: TabableRegionBehavior
      },

      ListViewKeyboardBehavior: {
        behaviorClass: ListViewKeyboardBehavior
      }
    },

    _getExpandedViewCollection: function (freshCollection) {
      if (!!freshCollection) {
        this.expandViewCollection = this.completeCollection ?
          this.completeCollection.clone() : this.collection.clone();
        // clone won't add the bo actions
        this.expandViewCollection.businessObjectActions = this.completeCollection.businessObjectActions || this.collection.businessObjectActions;
        this.expandViewCollection.columns = this.completeCollection.columns || this.collection.columns;
        this.listenTo(this.expandViewCollection, {
          'add': function (model) {
            this.collection.add(model, {
              at: 0
            });
          }
        });
      }
      return this.expandViewCollection;
    },

    filterChanged: function (event) {
      if (event && event.type === 'keyup' && event.keyCode === 27) {
        // Hitting Esc should get rid of the filtering control; it resets
        // the filter value automatically
        this.searchClicked();
      }

      var filterValue = this.ui.searchInput.val();
      // lastFilterValue => server filter

      if (this.lastFilterValue !== filterValue) {
        this.lastFilterValue = filterValue;
        // Wait 1 second to execute
        if (this.filterTimeout) {
          clearTimeout(this.filterTimeout);
        }
        this.filterTimeout = setTimeout(function (self) {
          self.filterTimeout = undefined;
          // reset infinite scrolling because in case filter is changed only first page should be fetched
          self._resetInfiniteScrolling();
          // reset collection that only the returned attachments are displayed
          // if not reset also old attachments are displayed ...
          self.collection.reset();
          // execute server side filtering
          var propertyName;
          if (self._getFilterPropertyName) {
            propertyName = self._getFilterPropertyName();
          }
          var filterOptions = {};
          filterOptions[propertyName || "name"] = filterValue;
          if (self.collection.setFilter(filterOptions, {
              fetch: false
            })) {
            self.messageOnError = lang.errorFilteringFailed;
            self.collection.fetch();
          }
        }, 1000, this);
      }
    },
    /**
     * Get the title icon for the widget.
     * Initially an invisible icon is returned until the rest call returns.
     * In case the rest call provides an title image this is returned as src, otherwise
     * the default workspace title image is returned as css.
     */
    _getTitleIcon: function () {
      // Set transparent gif that it can be replaced later with proper image
      var icon = {
        src: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        cssClass: undefined
      };

      if (this.busobjinfo.get("titleIcon")) {
        // For each workspace type one icon exist
        icon.src = this.busobjinfo.get("titleIcon");
        icon.cssClass = 'csui-icon';
      } else {
        // Need to return as class, because URL would not point to proper image
        // icon.cssClass = NodeSprites.findClassByNode(this.collection.node);

        icon.cssClass = 'xecmpf-attachmentstitleicondefault ' +
          NodeSpriteCollection.findClass('equals', 'type', 848);
      }
      return icon;
    },

    /**
     * Render attachment icon after rest call returns.
     * Depending on what and if rest call returns an icon,
     * set icon as class (default icon) or the configured one as src.
     * Icons are set via DOM manipulation.
     */
    _renderBusinessAttachmentTitleIcon: function () {
      var titleDivEl = this.$el.find('.tile-type-image')[0],
        titleImgEl = titleDivEl && this.$el.find('.tile-type-image').find("img")[0];
      if (titleImgEl) {
        var icon = this._getTitleIcon();
        if ($(titleImgEl).attr('src') !== icon.src) {
          $(titleImgEl).attr('src', icon.src);
        }

        if (icon.cssClass) {
          // Set via dom proper class that shows icon
          if ($(titleImgEl).attr('class') !== icon.cssClass) {
            $(titleImgEl).attr('class', icon.cssClass);
          }
        }

        // BITV 1.1.c: no information icon, Empty alt
        // attributes for layout graphics
        // WCAG20: H67
        $(titleImgEl).attr('alt', '');

        $(titleImgEl).after('<span class="csui-icon xecmpf-icon-boattachment-overlay" ' +
          'title="' + lang.businessAttachments + '"></span>');

      }
    },

    _getTitle: function () {
      var ret = lang.dialogTitle;

      if (this.options.data.title) {
        ret = base.getClosestLocalizedString(this.options.data.title, lang.dialogTitle);
      }

      return ret;
    },

    _getHeaderView: function () {
      var headerToolbarView = new HeaderToolbarView({
        commands: Commands,
        originatingView: this,
        containerEl: '.xecmpf-businessattachments .binf-modal-dialog .binf-modal-content',
        context: this.getContext(),
        collection: this._getExpandedViewCollection(false), //for toolbaritems (ex: create BA) new collection is not required always. 
        toolbarItems: HeaderToolbarItems,
        data: {
          extId: this.busobjinfo.get('extSystemId'),
          boType: this.busobjinfo.get('busObjectType'),
          boid: this.busobjinfo.get('busObjectKey')
        }
      });

      var titleIcon = this._getTitleIcon();
      var titleView = new TitleView({
        imageUrl: titleIcon.src,
        imageClass: titleIcon.cssClass,
        title: this._getTitle()
      });

      var headerView = new HeaderView({
        iconRight: 'icon-tileCollapse',
        leftView: headerToolbarView,
        centerView: titleView
      });

      return headerView;
    },

    _getSearchPlaceholder: function () {
      return lang.searchPlaceholder.replace("%1", this._getTitle());
    },

    childView: AttachmentItemView,

    childViewOptions: function () {
      // at least bo attachment name is displayed
      _.defaults(this.options.data, {
        collapsedView: {
          title: {
            value: "{name}"
          }
        }
      });
      _.defaults(this.options.data.collapsedView.title, {
        value: "{name}"
      });

      if (_.isEmpty(this.options.data.collapsedView.title) ||
        _.isEmpty(this.options.data.collapsedView.title.value)) {
        this.options.data.collapsedView.title = {
          value: "{name}"
        }
      }

      return {
        context: this.options.context,
        data: this.options.data.collapsedView
      };
    },

    emptyViewOptions: {
      templateHelpers: function () {
        var noBusObj = this._parent.busobjinfo.invalidConfigurationShown ?
          this._parent.busobjinfo.invalidErrorMessage : '';
        return {
          text: this._parent._getNoResultsPlaceholder() + noBusObj

        };
      }
    },
    // Attributes identify collection/models for widget
    // In case two widgets has returns same attributes here, they share the collection!!
    _getCollectionAttributes: function () {
      var boAttachmentProps = (this.options.data.busObjectId && this.options.data) ||
        (this.options.data && this.options.data.businessattachment &&
          this.options.data.businessattachment.properties) || {};
      return {
        busObjectType: (boAttachmentProps && boAttachmentProps.busObjectType),
        extSystemId: (boAttachmentProps && boAttachmentProps.extSystemId),
        busObjectId: (boAttachmentProps && boAttachmentProps.busObjectId),
        sortExpanded: this.options.data.expandedView &&
          attachmentUtil.orderByAsString(this.options.data.expandedView.orderBy) ||
          this._getDefaultSortOrder() || undefined,
        sortCollapsed: this.options.data.collapsedView &&
          attachmentUtil.orderByAsString(this.options.data.collapsedView.orderBy) ||
          this._getDefaultSortOrder() || undefined
      };

    },

    // Get the default sort order in case no sort order is defined
    _getDefaultSortOrder: function () {
      return this._getFilterPropertyName() ? this._getFilterPropertyName() + ' asc' : undefined;
    },

    _getCollectionUrlQuery: function () {
      var options = this.options,
        query = {};
      var orderByAsString;

      if (options.data.collapsedView) {
        orderByAsString = attachmentUtil.orderByAsString(options.data.collapsedView.orderBy);
      }
      if (!orderByAsString) {
        orderByAsString = this._getDefaultSortOrder();
      }
      if (orderByAsString) {
        query.sort = orderByAsString;
      }

      return query;
    },

    // get first placeholder from string with mix of column references and free text.
    _getFirstPlaceholder: function (expression) {
      var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g,
        match, propertyName, placeholder, result;
      // Go over every parameter placeholder found
      // Don't change expression while doing this, because exec remembers position of last matches
      while ((match = parameterPlaceholder.exec(expression))) {
        placeholder = match[0];
        propertyName = match[1];
        if (propertyName) {
          result = match;
          break;
        }
      }
      return result;
    },

    // Get property name to use for filtering
    _getFilterPropertyName: function () {
      var propertyName;
      if (this.options && this.options.data && this.options.data.collapsedView &&
        this.options.data.collapsedView.title && this.options.data.collapsedView.title.value) {
        var placeHolder = this._getFirstPlaceholder(this.options.data.collapsedView.title.value);
        if (placeHolder) {
          propertyName = placeHolder[1];
        }
      }
      return propertyName;
    },

    // return the jQuery list item element by index for keyboard navigation use
    getElementByIndex: function (index) {
      if (isNaN(index) || (index < 0)) {
        return null;
      }
      var $item = this.$(_.str.sformat(
        '.xecmpf-attachmentitem-object:nth-child({0}) .xecmpf-attachmentitem-border', index + 1));
      return this.$($item[0]);
    },
    _getNoResultsPlaceholder: function () {
      var ret = this.options.data &&
        this.options.data.collapsedView &&
        this.options.data.collapsedView.noResultsPlaceholder;

      if (ret) {
        ret = base.getClosestLocalizedString(ret, lang.noResultsPlaceholder);
      } else {
        ret = lang.noResultsPlaceholder;
      }

      return ret;
    },

    // To use default empty view from ListView, the following functions are needed
    collectionEvents: {
      'reset': 'onCollectionSync'
    },

    onCollectionSync: function () {
      this.synced = true;
    },

    isEmpty: function () {
      return this.synced && (this.collection.models.length === 0);
    },

    onRenderItem: function (childView) {
      childView._nodeIconView = new NodeTypeIconView({
        el: childView.$('.csui-type-icon').get(0),
        node: childView.model
      });
      childView._nodeIconView.render();
    },

    onBeforeDestroyItem: function (childView) {
      if (childView._nodeIconView) {
        childView._nodeIconView.destroy();
      }
    }
  });

  return BOAttachmentsView;
});

csui.define('css!xecmpf/widgets/workspaces/controls/tile/impl/tile',[],function(){});
csui.define('xecmpf/widgets/workspaces/controls/tile/tile.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette', 'csui/utils/log',
    'csui/utils/base',
    'csui/controls/tile/tile.view',
    'css!xecmpf/widgets/workspaces/controls/tile/impl/tile'

], function (module, $, _, Backbone, Marionette, log, base,
             TileView_
) {

    var TileView = TileView_.extend({
        constructor: function TileView(options) {
            TileView_.prototype.constructor.apply(this, arguments);
        }
    });
    return TileView;
});

csui.define('xecmpf/widgets/workspaces/factories/workspace.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
    'csui/utils/contexts/factories/factory',
    'xecmpf/widgets/workspaces/models/workspace.collection',
    'csui/utils/contexts/factories/connector',
    'csui/utils/commands',
], function (module, _, Backbone,
             CollectionFactory,
             WorkspaceCollection,
             ConnectorFactory,
             allCommands) {
    'use strict';

    var WorkspaceCollectionFactory = CollectionFactory.extend({

        propertyPrefix: 'workspaces',

        constructor: function WorkspaceCollectionFactory(context, options) {
            options || (options = {});

            CollectionFactory.prototype.constructor.apply(this, arguments);
            var workspaces = this.options.workspaces || {};

            if (!(workspaces instanceof Backbone.Collection)) {
                workspaces = new WorkspaceCollection(workspaces.models, _.extend({},
                    this.options.workspaces, {
                    // Prefer refreshing the entire table to rendering one row after another.
                    autoreset: true,
                    // Ask the server to check for permitted actions V2
                    commands: allCommands.getAllSignatures(),
                    // Do not request the v1 actions, which are sent by default
                    includeActions: false,
                    connector: context.getObject(ConnectorFactory)
                }));
            }
            this.property = workspaces;
        },

        fetch: function (options) {
            return this.property.fetch(options);
        }

    });

    return WorkspaceCollectionFactory;

});

csui.define('xecmpf/widgets/workspaces/factories/workspace.types.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
    'csui/utils/contexts/factories/factory',
    'xecmpf/widgets/workspaces/models/workspace.types.collection',
    'csui/utils/contexts/factories/connector',
], function (module, _, Backbone,
             CollectionFactory,
             WorkspaceTypesCollection,
             ConnectorFactory) {

    var WorkspaceTypesCollectionFactory = CollectionFactory.extend({

        propertyPrefix: 'workspaceTypes',

        constructor: function WorkspaceTypesCollectionFactory(context, options) {

            CollectionFactory.prototype.constructor.apply(this, arguments);
            var workspaceTypes = new WorkspaceTypesCollection(undefined, {
                // Prefer refreshing the entire table to rendering one row after another.
                autoreset: true,
                config: this.options.workspaceTypes,
                connector: context.getObject(ConnectorFactory)
            });
            this.property = workspaceTypes;
        },

        fetch: function (options) {
            return this.property.fetch(options);
        }

    });

    return WorkspaceTypesCollectionFactory;

});

csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/impl/nls/root/lang',{
    NodeTableNoFilteredItems: 'There are no early workspaces to display.',
    createNew: "Create new",
    createNewTooltip: 'Create business workspace'
});


csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/tabletoolbar.view',['module', 'require', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone', 'csui/lib/marionette', 'csui/utils/log', 'csui/utils/base',
    'csui/controls/toolbar/toolitem.model',
    // 'csui/controls/toolbar/impl/toolitems.filtered.model',
    'csui/controls/toolbar/toolitems.filtered.model',
    'csui/controls/toolbar/toolbar.view',
    'csui/utils/commands',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/controls/tabletoolbar/tabletoolbar.view',
    "csui/utils/url",
    'xecmpf/widgets/workspaces/factories/workspace.types.factory',
    'i18n!xecmpf/widgets/workspaces/controls/workspaces.table/impl/nls/lang'
], function (module, require, $, _, Backbone, Marionette, log, base,
             ToolItemModel, FilteredToolItemsCollection,
             ToolbarView,
             Commands,
             LayoutViewEventsPropagationMixin,
             TableToolbarView,
             Url,
             WorkspaceTypeCollectionFactory,
             lang) {
    'use strict';

    var AddWorkspaceToolbarView = ToolbarView.extend({

            cssPrefix: "binf-",
            ui: {
                dropdown: '.binf-dropdown-toggle'
            },
            events: {
                'click @ui.dropdown': 'adjustDropdown'
            },

            _makeDropDown: function () {
                var e = '<a href="#" class="' + this.cssPrefix + 'dropdown-toggle csui-acc-focusable"  data-binf-toggle="dropdown" aria-expanded="true"';
                if (this.options.dropDownText) {
                    e += ' title="' + this.options.dropDownText + '">';
                } else {
                    e += '>';
                }
                if (this.options.dropDownIcon) {
                    e += '<span class="' + this.options.dropDownIcon + '"></span>';
                } else {
                    if (this.options.dropDownText) {
                        e += this.options.dropDownText;
                    }
                }
                e += "<span class='toolbarlabel'>" + lang.createNew + "</span></a>";
                return e;
            },
            adjustDropdown: function (event) {
                if (this.collection.length <= 1) {
                    // hide drop down
                    this.$el.find("." + this.cssPrefix + "dropdown-menu").css("display", "none");
                    var args = {toolItem: this.collection.at(0)};
                    this.children.first().triggerMethod("before:toolitem:action", args);
                    this.children.first().triggerMethod("toolitem:action", args);
                }
            }
        })
        ;
    var AddWorkspaceTableToolbarView = TableToolbarView.extend({

        constructor: function TableToolbarView(options) {
            Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options

            this.context = this.options.context;
            this.commands = this.options.commands || Commands;
            this.toolbarNames = ['add'];

            // create toolbar with filtered commands
            var addToolbarFactory = this.options.toolbarItems['addToolbar'],
                toolbarView = this['addToolbarView'] = new AddWorkspaceToolbarView(_.extend({
                    // filter entries in toolbar
                    collection: new FilteredToolItemsCollection(
                        addToolbarFactory, {
                            status: {},  // must be set
                            commands: this.commands,
                            delayedActions: false
                        }), // <=  filter toolbar items (actions) for add toolbar
                    toolbarName: "add"
                }, addToolbarFactory.options));

            this
                .listenTo(toolbarView, 'childview:toolitem:action',
                    function (toolItemView, args) {
                        this.trigger('toolbarItem:clicked', args.toolItem.attributes.commandData);
                    }
                )
                .listenTo(toolbarView, 'dom:refresh', function () {
                    this.triggerMethod('refresh:tabindexes');
                });
            this._updateAddToolbar();
            this.propagateEventsToRegions();
        },
        // called from nodestable.view when the selection of nodes changed -> update the toolbars
        updateForSelectedChildren: function (selectedNodes) {
            // skip
        },

        _addMenuItems: function (toolItems, businessWorkspaceTypes) {
            businessWorkspaceTypes.models.forEach(function (bwtype) {
                // note: signature of toolbar item must match with a command or indicates entry as separator

                if (!_.isEmpty(bwtype.get("templates"))) {
                    _.each(bwtype.get("templates"), function (tmpl) {
                        var toolItem = new ToolItemModel({
                            signature: "AddConnectedWorkspace", // must match with filteredToolItemCollection
                            name: tmpl.name,
                            group: 'conws',
                            commandData: {
                                wksp_type_name: bwtype.get("wksp_type_name"), //. props.wksp_type_name,
                                wksp_type_id: bwtype.get("wksp_type_id"), // props.wksp_type_id,
                                template: tmpl,
                                type: tmpl.subType,
                                rm_enabled: bwtype.get("rm_enabled")
                            }
                        });
                        toolItems.push(toolItem);
                    });
                }
            });
        },

        onBeforeShow: function () {
            // empty toolbar
            this.$el.find("li").remove();
            this.options.toolbarItems.addToolbar.reset(this.toolbarItems);
        },
        _updateAddToolbar: function () {
            // build toolbar
            this.toolbarItems = [];
            this.workspaceTypesCollection = this.options.context.getCollection(
                WorkspaceTypeCollectionFactory, {
                    busObjectType: this.options.data.busObjectType,
                    extSystemId: this.options.data.extSystemId
                });

            this._addMenuItems(this.toolbarItems, this.workspaceTypesCollection);
        }
    });

    _.extend(AddWorkspaceTableToolbarView.prototype, LayoutViewEventsPropagationMixin);

    return AddWorkspaceTableToolbarView;

});


csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/table.columns',["csui/lib/backbone"], function (Backbone) {

    var TableColumnModel = Backbone.Model.extend({

        idAttribute: "key",

        defaults: {
            key: null,  // key from the resource definitions
            sequence: 0 // smaller number moves the column to the front
        }

    });

    var TableColumnCollection = Backbone.Collection.extend({

        model: TableColumnModel,
        comparator: "sequence",

        getColumnKeys: function () {
            return this.pluck('key');
        },

        deepClone: function () {
            return new TableColumnCollection(
                this.map(function (column) {
                    return column.attributes;
                }));
        }

    });
    var tableColumns = new TableColumnCollection([
        {
            key: 'name',
            sequence: 1,
            permanentColumn: true // don't wrap column due to responsiveness into details row
        },
        {
            key: 'modify_date',
            sequence: 2,
            permanentColumn: true // don't wrap column due to responsiveness into details row
        }
    ])
    return tableColumns;

});

csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/toolbaritems',['csui/lib/underscore', 'csui/utils/base',
    'csui/controls/toolbar/toolitems.factory',
    'i18n!xecmpf/widgets/workspaces/controls/workspaces.table/impl/nls/lang',
], function (_, base, ToolItemsFactory, lang ) {

    var toolbarItems = {

        addToolbar: new ToolItemsFactory({
                add: []
            },
            {
                maxItemsShown: 0, // force toolbar to immediately start with a drop-down list
                dropDownIcon: "icon icon-toolbarAdd",
                dropDownText: lang.createNewTooltip,
                addTrailingDivider: false
            })

    };

    return toolbarItems;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/workspaces/controls/workspaces.table/impl/workspacestable',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"tabletoolbar\"></div>\r\n<div id=\"tableview\"></div>\r\n<div id=\"paginationview\"></div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_workspaces_controls_workspaces.table_impl_workspacestable', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/workspaces/controls/workspaces.table/impl/workspacestable',[],function(){});
csui.define('xecmpf/widgets/workspaces/controls/workspaces.table/workspaces.table.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/log',
    'csui/utils/base',

    'csui/utils/contexts/factories/connector',
    'csui/controls/progressblocker/blocker',
    'csui/controls/table/cells/name/name.view',
    'csui/behaviors/default.action/default.action.behavior',
    'xecmpf/widgets/workspaces/factories/workspace.factory',
    'csui/utils/contexts/factories/columns',
    'csui/controls/table/table.view',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',

    'xecmpf/widgets/workspaces/controls/workspaces.table/tabletoolbar.view',
    'xecmpf/widgets/workspaces/controls/workspaces.table/table.columns',
    'xecmpf/widgets/workspaces/controls/workspaces.table/toolbaritems',
    'csui/controls/pagination/nodespagination.view',

    'i18n!xecmpf/widgets/workspaces/controls/workspaces.table/impl/nls/lang',
    'hbs!xecmpf/widgets/workspaces/controls/workspaces.table/impl/workspacestable',
    'css!xecmpf/widgets/workspaces/controls/workspaces.table/impl/workspacestable'
], function (module, $, _, Backbone,
             Marionette, log, base,
             ConnectorFactory,
             BlockingView,
             NameCellView,
             DefaultActionBehavior,
             WorkspacesCollectionFactory,
             ColumnCollectionFactory,
             TableView,
             LayoutViewEventsPropagationMixin,
             TableToolbarView,
             TableColumns,
             ToolbarItems,
             PaginationView,
             lang, template, css) {

    var config = module.config();

    _.defaults(config, {
        defaultPageSize: 30,
        clearFilterOnChange: true,
        resetOrderOnChange: false,
        resetLimitOnChange: true,
        fixedFilterOnChange: false
    });

    NameCellView.prototype.getValueData = function () {

        var column = this.options.column,
            node = this.model,
            name = node.get(column.name);

        return {
            defaultAction: 'displayWorkspace',
            defaultActionUrl: '',
            contextualMenu: column.contextualMenu,
            name: name,
            inactive: node.get('inactive')
        };
    };

    var WorkspacesTableView = Marionette.LayoutView.extend({
        template: template,
        className: 'xecmpf_workspacestable',
        regions: {
            tableToolbarRegion: '#tabletoolbar',
            tableRegion: '#tableview',
            paginationRegion: '#paginationview'
        },
        ui: {
            outerTableContainer: '#outertablecontainer',
            innerTableContainer: '#innertablecontainer',
            tableView: '#tableview',
            paginationView: '#paginationview'
        },
        behaviors: {
            DefaultAction: {
                behaviorClass: DefaultActionBehavior
            }
        },

        constructor: function WorkspacesTableView(options) {
            options || (options = {});
            _.defaults(options, {
                data: {},
                pageSize: config.defaultPageSize,
                toolbarItems: ToolbarItems,
                defaultPageSize: config.defaultPageSize,
                clearFilterOnChange: config.clearFilterOnChange,
                resetOrderOnChange: config.resetOrderOnChange,
                resetLimitOnChange: config.resetLimitOnChange,
                fixedFilterOnChange: config.fixedFilterOnChange
            });

            this.context = options.context;
            this.connector = this.context.getObject(ConnectorFactory);

            var height = options.data.height || options.height;
            if (height) {
                this.$el.height(height);
            }

            // Inheritors of this object start blocking actions in initialize().
            // Initializing of the blocking view has to happen before the parent
            // constructor gets called, or better, before initialize() is executed.
            // This is a result of breaking two rules:
            // 1. Nobody should inherit from widgets.
            // 2. constructor should not be overridden together with initialize.
            BlockingView.imbue(this);
            // calls initialize
            Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options

            this.collection = this.options.collection = this.context.getCollection(
                WorkspacesCollectionFactory, {
                    attributes: 'early'
                });
            this.columns = this.collection.columns;
            this.tableColumns = TableColumns.deepClone();
            this._setToolBar(ToolbarItems);
            this.defaultActionController.executeAction = function (node) {
                return $.Deferred().resolve();
            }

            this._setTableView();
            this._setPagination();
            this.propagateEventsToRegions();
        },

        _setTableView: function () {

            this.tableView = new TableView({
                selectRows: "none",
                context: this.options.context,
                connector: this.connector,
                collection: this.collection,
                columns: this.columns,
                tableColumns: this.tableColumns,
                pageSize: this.options.data.pageSize,
                originatingView: this,
                columnsWithSearch: ["name"],
                orderBy: this.options.orderBy,
                filterBy: this.options.filterBy,
                blockingParentView: this,
                tableTexts: {
                    zeroRecords: lang.NodeTableNoFilteredItems
                }
            });


            // FIXME: Computing maximum column count (_adjustColumnsAfterWindowResize)
            // does not return the same value as set by rebuilding the table (rebuild)
            // unless an extra div  is appended to the table.  Why?
            this.listenTo(this.tableView, 'render', function () {
                this.tableView.$el.append($('<div>')[0]);
            });

            this._setTableViewEvents();
        },
        _setTableViewEvents: function () {

            this.listenTo(this.tableView, 'dom:refresh', function () {
                $('.csui-nodetable')[0] && !$('.csui-not-ready')[0]  && $('.csui-nodetable').focus();
                // $('.csui-addToolbar')[0] && !$('.csui-addToolbar')[0]  && $('.csui-addToolbar').focus();
            });

            this.listenTo(this.tableView, 'execute:defaultAction', function (node) {
                var args = {node: node};
                this.trigger('before:defaultAction', args);
                if (!args.cancel) {
                    var self = this;
                    this.defaultActionController
                        .executeAction(node, {
                            context: this.options.context,
                            originatingView: this
                        })
                        .done(function () {
                            self.trigger('executed:defaultAction', args);
                        });
                }
            });

            return true;
        },
        _setToolBar: function (toolItems) {
            // toolbarItems is an object with several TooItemFactories in it (for each toolbar one)
            this.tableToolbarView = new TableToolbarView(
                _.defaults(this.options, {
                    context: this.options.context,
                    toolbarItems: toolItems,
                    collection: this.collection,
                    originatingView: this,
                }));

            this.listenTo(this.tableToolbarView, 'before:execute:command', this._beforeExecuteCommand);
            this.listenTo(this.tableToolbarView, 'after:execute:command', this._toolbarActionTriggered);
            this.listenTo(this.tableToolbarView, 'toolbarItem:clicked',
                function (args) {
                    this.trigger('toolbarItem:clicked', args);
                }
            );

            return true;
        },

        _setPagination: function () {
            this.paginationView = new PaginationView({
                collection: this.collection,
                pageSize: this.options.data.pageSize || this.options.pageSize,
                defaultDDList: this.options.ddItemsList,
                // this.options.ddItemsList,
                externalWidget: this.options.externalWidget
            });

            return true;
        },
        onShow: function () {
            _.each(this.regionManager._regions, function (region) {
                if (region.currentView) {
                    region.currentView.triggerMethod('show');
                }
            });
        },

        onAfterShow: function () {
            _.each(this.regionManager._regions, function (region) {
                if (region.currentView) {
                    region.currentView.triggerMethod('after:show');
                }
            });
        },
        onRender: function () {
            this.tableToolbarRegion.show(this.tableToolbarView);
            this.tableRegion.show(this.tableView);
            this.paginationRegion.show(this.paginationView);
        }
    });
    _.extend(WorkspacesTableView.prototype, LayoutViewEventsPropagationMixin);
    return WorkspacesTableView;
});


csui.define('xecmpf/widgets/workspaces/pages/select.workspace/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/workspaces/pages/select.workspace/impl/nls/root/lang',{
  pageTitle: 'Create or complete business workspace'
});



/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/workspaces/pages/select.workspace/impl/select.workspace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"content\"></div>\r\n\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_workspaces_pages_select.workspace_impl_select.workspace', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/workspaces/pages/select.workspace/impl/select.workspace',[],function(){});
csui.define('xecmpf/widgets/workspaces/pages/select.workspace/select.workspace.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette', 'csui/utils/log', 'csui/utils/base',
    'xecmpf/widgets/workspaces/controls/tile/tile.view',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    "xecmpf/widgets/workspaces/controls/workspaces.table/workspaces.table.view",
    "i18n!xecmpf/widgets/workspaces/pages/select.workspace/impl/nls/lang",
    'hbs!xecmpf/widgets/workspaces/pages/select.workspace/impl/select.workspace',
    'css!xecmpf/widgets/workspaces/pages/select.workspace/impl/select.workspace',

], function (module, $, _, Backbone, Marionette, log, base,
             TileView,
             LayoutViewEventsPropagationMixin,
             WorkspacesTableView,
             lang,
             template,
             css) {


    var SelectWorkspaceView = Marionette.LayoutView.extend({
            tagName: "div",
            id: "xecmpf-select_wksp",
            className: "xecmpf-page",

            template: template,
            regions: {
                content: "#content"
            },
            constructor: function SelectWorkspaceView(options) {
                Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options
                this.context = this.options.context;
                this.propagateEventsToRegions();
            },
            _getController: function () {
                return this.options.status.wksp_controller;
            },
            onBeforeShow: function () {
                var options = this.options;
                this.tileView = new TileView({
                    title: lang.pageTitle,
                    contentView: WorkspacesTableView,
                    contentViewOptions: options
                });

                this.getRegion('content').show(this.tileView);
                this.listenTo(this.tileView.contentView, 'toolbarItem:clicked', function (workspaceType) {
                    // workspace template selected
                    _.defaults(options.status, {
                        workspaceType: new Backbone.Model(workspaceType)
                    });

                    this._getController().createWorkspace(options);
                    return $.Deferred().resolve();
                });
                this.listenTo(this.tileView.contentView, 'executed:defaultAction', function (args) {
                    options.status || (options.status = {});
                    // set selected workspace
                    options.status.workspace = args.node;
                    this._getController().updateWorkspace(options);
                });
            }
        })
        ;

    _.extend(SelectWorkspaceView.prototype, LayoutViewEventsPropagationMixin);

    return SelectWorkspaceView;
})
;


csui.define('css!xecmpf/widgets/workspaces/controls/footer/impl/footer',[],function(){});
csui.define('xecmpf/widgets/workspaces/controls/footer/footer.view',['csui/lib/marionette',
    'csui/lib/underscore',
    'csui/lib/jquery',
    'csui/behaviors/keyboard.navigation/tabable.region.behavior',
    'csui/behaviors/keyboard.navigation/tabables.behavior',
    'css!xecmpf/widgets/workspaces/controls/footer/impl/footer'
], function (Marionette, _, $, TabableRegion) {

    var ButtonView = Marionette.ItemView.extend({

        tagName: 'button',
        className: 'binf-btn',
        template: false,
        triggers: {
            'click': 'click'
        },
        behaviors: {
            TabableRegion: {
                behaviorClass: TabableRegion
            }
        },

        constructor: function ButtonView(options) {
            Marionette.ItemView.prototype.constructor.apply(this, arguments);
        },

        isTabable: function () {
            return this.$el.is(':not(:disabled)') && this.$el.is(':not(:hidden)');
        },
        currentlyFocusedElement: function () {
            if (this.$el.prop('tabindex') === -1) {
                this.$el.prop('tabindex', 0);
            }
            return this.$el;
        },
        onRender: function () {
            var $button = this.$el;
            $button.text(this.model.get("label"));
            $button.addClass(this.model.get('primary') ? 'binf-btn-primary' : 'binf-btn-default');
            $button.attr('title', (this.model.get("toolTip") ? this.model.get("toolTip") : ""));

            if (this.model.get("separate")) {
                $button.addClass('cs-separate');
            }
            this.updateButton(this.model);
        },

        updateButton: function (model) {
            var $button = this.$el;

            if (model.get("hidden") !== undefined) {
                if (model.get("hidden")) {
                    $button.addClass('hidden');
                } else {
                    $button.removeClass('hidden');
                }
            }

            if (model.get("primary") === true) {
                $button.removeClass('binf-btn-default');
                $button.addClass('binf-btn-primary');
            } else {
                $button.addClass('binf-btn-default');
            }

            if (model.get("disabled") !== undefined) {
                $button.prop('disabled', model.get("disabled"));
            }
        }

    });

    var FooterView = Marionette.CollectionView.extend({
        id: "wksp_footer",
        tagName: "div",
        className: "binf-modal-footer",
        childView: ButtonView,

        constructor: function FooterView(options) {
            Marionette.CollectionView.prototype.constructor.apply(this, arguments);
            this.listenTo(this, 'childview:click', this.onClickButton);
        },
        onDomRefresh: function () {
            this.children.each(function (buttonView) {
                buttonView.trigger('dom:refresh');
            });
        },
        onClickButton: function (buttonView) {
            // button collection model attribute
            buttonView.$el.prop('disabled', true);

            if (buttonView.model.get("click")) {
                buttonView.model.get("click")().fail(function () {
                        buttonView.$el.prop('disabled', false);
                    }
                )
            }
        },
        update: function () {
            var self = this;
            this.collection.models.forEach(function (buttonModel) {
                self.children
                    .findByModel(buttonModel)
                    .updateButton(buttonModel);
            });
        }
    });

    return FooterView;
});
csui.define('xecmpf/widgets/workspaces/pages/create.workspace/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/workspaces/pages/create.workspace/impl/nls/root/lang',{
    pageTitle: 'Create business workspace',
    createWorkspace: 'Create',
    cancel: 'Cancel',
    failedToCreateItem: 'Failed to create the new item.',
    nameIsGeneratedAutomatically: 'Workspace name is generated automatically.',
    errorGettingCreateForm: 'Error getting form for workspace creation.',
    businessWorkspaceTypeName: 'Business Workspace',
    createWorkspaceTooltip: 'Create business workspace'
});



/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/workspaces/pages/create.workspace/impl/create.workspace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"content\" class=\"cs-properties-wrapper\"></div>\r\n<div id=\"footer\"></div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_workspaces_pages_create.workspace_impl_create.workspace', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/workspaces/pages/create.workspace/impl/create.workspace',[],function(){});
/**
 * Created by cknoblic on 08.09.2016.
 */
csui.define('xecmpf/widgets/workspaces/pages/create.workspace/create.workspace.view',['module', 'csui/lib/jquery', 'csui/lib/underscore', 'csui/lib/backbone',
    'csui/lib/marionette', 'csui/utils/log', 'csui/utils/base',
    'xecmpf/widgets/workspaces/controls/tile/tile.view',
    'xecmpf/widgets/workspaces/controls/footer/footer.view',
    'csui/widgets/metadata/metadata.add.item.controller',
    'csui/widgets/metadata/metadata.action.one.item.properties.view',
    'conws/models/workspacecreateforms',
    'conws/models/metadata.controller',
    "csui/models/node/node.model",
    'conws/models/metadata.controller',
    'csui/utils/contexts/factories/connector',
    'csui/dialogs/modal.alert/modal.alert',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/behaviors/keyboard.navigation/tabables.behavior',
    'csui/widgets/metadata/metadata.properties.view',
    'csui/utils/url',
    "i18n!xecmpf/widgets/workspaces/pages/create.workspace/impl/nls/lang",
    'hbs!xecmpf/widgets/workspaces/pages/create.workspace/impl/create.workspace',
    'css!xecmpf/widgets/workspaces/pages/create.workspace/impl/create.workspace'

], function (module, $, _, Backbone, Marionette, log, base, TileView,
             FooterView,
             MetadataAddItemController,
             MetadataActionOneItemPropertiesView,
             WorkspaceCreateFormCollection,
             WorkspaceMetadataController,
             NodeModel,
             MetadataController,
             ConnectorFactory,
             ModalAlert,
             LayoutViewEventsPropagationMixin,
             TabablesBehavior,
             MetadataPropertiesView,
             Url,
             lang,
             template,
             css) {


    var CreateWorkspaceView = Marionette.LayoutView.extend({
        tagName: "div",
        id: "xecmpf-create_wksp",
        className: "xecmpf-page",
        template: template,
        regions: {
            content: "#content",
            footer: "#footer"
        },
        behaviors: {
            TabablesBehavior: {
                behaviorClass: TabablesBehavior,
                recursiveNavigation: true,
                containTabFocus: true
            }
        },

        constructor: function CreateWorkspaceView(options) {
            Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options
            var self = this;
            this.context = this.options.context || {};
            this.buttonCollecion = new Backbone.Collection(),

            this.propagateEventsToRegions();
            // FIXME keyboard keydown event is registered twice see LPAD-54770
            this.on('dom:refresh', function () {
                if ($._data) {
                    var events = $._data( this.el, "events");
                    if (events &&  events.keydown && events.keydown.length > 1) {
                        var eventName = !_.isEmpty(events.keydown[1].namespace)?
                            events.keydown[1].type  +'.' + events.keydown[1].namespace:events.keydown[1].type;
                        eventName && events.keydown[1].handler && self.$el.off( eventName, events.keydown[1].handler)
                    }
                }
            });
            // FIXME Disable classifcations
            csui.require(['classifications/widgets/metadata/general.fields/classifications/metadata.general.form.field.controller',
                    'classifications/utils/commands/add.classifications'],
                    function(MetadataClassificationsGeneralFormFieldController, MetadataAddClassificationController) {
                        MetadataClassificationsGeneralFormFieldController.prototype.getGeneralFormFieldsForCreate = function() {
                            return null;
                        }
                        MetadataAddClassificationController.prototype.enabled = function() {
                            return false;
                        };

                    }, function() {
                        // not installed?
                    })
        },

        _getController: function () {
            return this.options.status.wksp_controller;
        },
        _create: function (options) {
            var data = this.metadataAddItemPropView.getValues(),
                dfd = $.Deferred();
            if (!_.isEmpty(data)) {
                data.bo_id = this.options.data.busObjectId;
                data['type'] = 848;

                this.metadataController.createItem(this.node, data)
                    .done(_.bind(function (resp) {
                        if (resp) {
                            var responseData = resp.results && resp.results.data;
                            var nodeId = responseData && responseData.properties && responseData.properties.id;
                            _.extend(options.status, {
                                workspaceNode: new NodeModel({
                                    id: nodeId,
                                    container: true
                                }),
                                viewMode: {
                                    mode: options.data.viewMode ? options.data.viewMode.mode : 'folderBrowse'
                                }
                            });
                            this._getController().displayWorkspace(options);
                        }
                    }, this))
                    .fail(function (resp) {

                        var error = lang.failedToCreateItem;
                        if (resp) {
                            if (resp.responseJSON && resp.responseJSON.error) {
                                error = resp.responseJSON.error;
                            } else if (resp.responseText) {
                                error = resp.responseText;
                            }
                            ModalAlert.showError(error);
                        }
                        dfd.reject();
                    });
            } else {
                // user entered invalid values
                dfd.reject();
            }
            return dfd.promise()
        },
        _createFormCollection: function () {

            var options = this.options || {},
                status = options.status || {},
                context = options.context || {},
                workspaceType = status.workspaceType,
                self = this;

            // options required by constructor
            this.formCollection = new WorkspaceCreateFormCollection(undefined,
                _.defaults(options, {
                    type: workspaceType.get("type"),
                    wsType: workspaceType.get("wksp_type_id"),
                    node: new NodeModel({}, {
                            // node model collection needs connector
                            connector: context.getObject(ConnectorFactory)
                        }
                    ),
                    actionContext: {
                        mode: "create"
                    }
                }));

            // bo_id is set externally
            this.formCollection.bo_id = options.data.busObjectId;
            // overwrite url calculation
            this.formCollection.url = function () {
                //var path = 'forms/nodes/create',
                var path = 'forms/businessworkspaces/create',
                    params = {
                        //     template_id: workspaceType.get("template").id,
                        bo_id: options.data.busObjectId,
                        bo_type: options.data.busObjectType,
                        ext_system_id: options.data.extSystemId
                    },
                    resource = path + '?' + $.param(_.omit(params, function (value) {
                            return value === null || value === undefined || value === '';
                        })),
                    url = context.getObject(ConnectorFactory).connection.url;
                return Url.combine(url && url.replace('/v1', '/v2') || url, resource);
            };


            this.formCollection.on("error", function (model, response, options) {
                var errmsg = response && (new base.Error(response)).message || lang.errorGettingCreateForm;
                log.error("Fetching the create forms failed: {0}", errmsg) && console.error(log.last);
                ModalAlert.showError(errmsg);
                if (_.isEmpty(status.mode)) {
                    self.buttonCollecion.length>=2 && self.buttonCollecion.at(1).set('disabled', false);
                }
                // SAPRM-9249
                self.tileView.contentView.metadataHeaderView.metadataItemNameView.remove( );
                // End of SAPRM-9249
                self.footerView && self.footerView.update();
            });

            this.formCollection.on("sync", function () {
                self._updateNameAndView(self.node, self.formCollection)
            });

        },
        _updateNameAndView: function (nodeModel, formCollection) {
            // we have special behavior for the name field, depending on the forms result.
            // so we put the code here, where we have access to the name field in the dialog header.
            var general = formCollection.at(0);

            var data = general.get("data");
            if (data) {
                var name = data.name;
                log.debug("name fetched and used: {0}", name) && console.log(log.last);
                nodeModel.set({name: name});
            } else {
                // if no server data object is set, then we set an empty name.
                log.debug("name set to empty.") && console.log(log.last);
                nodeModel.set({name: ""});
            }

            var metadataView = this.tileView.contentView,
                headerView = metadataView && metadataView.metadataHeaderView,
                nameView = headerView && headerView.metadataItemNameView;
            if (nameView) {
                var gs = general.get("schema"),
                    isReadOnly = (gs && gs.properties && gs.properties.name && gs.properties.name.readonly) ? true : false,
                    placeHolder = isReadOnly ? lang.nameIsGeneratedAutomatically : undefined;
                nameView.setPlaceHolder(placeHolder);
                if ((isReadOnly ? true : false) !== (nameView.readonly ? true : false)) {
                    nameView.setReadOnly(isReadOnly);
                }
            }
        },
        render: function () {

            var self = this,
                options = this.options || {},
                context = options.context || {},
                status = this.options.status || {};

            Marionette.LayoutView.prototype.render.apply(this, arguments);

            this.buttonCollecion.add({
                click: _.bind(this._create, this, this.options),
                disabled: true, primary: false,
                label: lang.createWorkspace, toolTip: lang.createWorkspaceTooltip
            });

            // in direct create mode there is no cancel/switch back
            // to early workspace selection
            if (_.isEmpty(status.mode)) {
                this.buttonCollecion.add({
                    click: _.bind(function () {
                        var dfd = $.Deferred();
                        this._getController().selectWorkspace();
                        dfd.resolve();
                        return dfd.promise();
                    }, this, this.options),
                    disabled: true, primary: false, toolTip: lang.cancel,
                    label: lang.cancel, separate: false
                });
            }

            this.footerView = new FooterView({
                collection: this.buttonCollecion
            });

            // created/result node
            this.node = new NodeModel({
                type_name: lang.businessWorkspaceTypeName,
                type: 848,
                container: true,
                rm_enabled: this.options.status.workspaceType.get('rm_enabled'), 
                name: "" // start with empty name
            }, {
                connector: context.getObject(ConnectorFactory)
            });

            this._createFormCollection();
            this.metadataController = new WorkspaceMetadataController(undefined, {
            });

            var CreatePropertiesView = MetadataActionOneItemPropertiesView.extend({
                    constructor: function CreatePropertiesView(options) {
                        MetadataActionOneItemPropertiesView.prototype.constructor.apply(this, arguments);
                        if (this.metadataPropertiesView !== undefined) {
                            this.metadataPropertiesView.stopListening(this);
                        }

                        this.metadataPropertiesView = new MetadataPropertiesView({
                            node: self.node,
                            context: self.options.context,
                            formMode: 'create',
                            action: 'create',
                            metadataView: this,
                            formCollection: self.formCollection
                        });
                        this.listenTo(this.metadataPropertiesView, 'render:forms', function () {
                            self.buttonCollecion.at(0).set('disabled', false);
                            // in direct create there is only one button
                            if (_.isEmpty(status.mode)) {
                                self.buttonCollecion.at(1).set('disabled', false);
                                self.buttonCollecion.at(0).set('primary', true);
                            } else {
                                self.buttonCollecion.at(0).set('primary', true);
                            }

                            self.footerView.update();
                        });

                        this.listenTo(this.metadataPropertiesView, 'before:render', function () {
                            // remove conws reference panel
                            var conwsRef = this.metadataPropertiesView.collection.findWhere({id: "conws-reference"});
                            if (conwsRef) {
                                this.metadataPropertiesView.collection.remove(conwsRef, {silent: true});
                            }
                        });
                    }
                }
            );

            this.tileView = new TileView({
                title: lang.pageTitle,
                contentView: CreatePropertiesView,
                contentViewOptions: {
                    model: this.node,
                    context: context,
                    action: 'create',
                    formCollection: this.formCollection
                }
            });

        },
        onBeforeShow: function () {
            this.content.show(this.tileView);
            this.footer.show(this.footerView);
            this.metadataAddItemPropView = this.tileView.contentView;
        }
    });

    _.extend(CreateWorkspaceView.prototype, LayoutViewEventsPropagationMixin);
    return CreateWorkspaceView;
});


csui.define('xecmpf/widgets/workspaces/pages/display.workspace/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/workspaces/pages/display.workspace/impl/nls/root/lang',{
    failedAuthentication: 'Authentication failed.'
});



/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"display_wksp_content\">\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_workspaces_pages_display.workspace_impl_display.workspace', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace',[],function(){});
csui.define('xecmpf/widgets/workspaces/pages/display.workspace/display.workspace.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
  'csui/lib/backbone',
  'csui/lib/marionette', 'csui/utils/log', 'csui/utils/base',
  'csui/utils/contexts/page/page.context',
  'csui/utils/commands',
  'xecmpf/utils/commands/workspaces/workspace.delete',
  'csui/integration/folderbrowser/folderbrowser.widget',
  'csui/utils/contexts/factories/connector',
  'xecmpf/utils/commands/folderbrowse/open.full.page.workspace',
  'csui/dialogs/modal.alert/modal.alert',
  'i18n!xecmpf/widgets/workspaces/pages/display.workspace/impl/nls/lang',
  'hbs!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace',
  'css!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace'

], function (module, $, _, Backbone, Marionette, log, base, PageContext,
    CsuiCommands, WkspDeleteCmd,
    FolderBrowserWidget, ConnectorFactory, OpenFullPageWorkspaceView,
    ModalAlert, lang,
    template,
    css) {

  var DisplayWorkspaceView = Marionette.LayoutView.extend({
    template: template,
    tagName: "div",
    id: "xecmpf-display_wksp",
    className: "xecmpf-page",

    regions: {
      content: "#display_wksp_content"
    },
    constructor: function DisplayWorkspaceView(options) {
      options || (options = {});
      Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options
    },

    // SAPRM-10672: authenticate with xecmauth before using /xecm-handler:
    authenticateXecm: function (cgiUrl, deferred) {
      var that = this;
      deferred = deferred || $.Deferred();
      if (!!this.connector.connection.session && !!this.connector.connection.session.ticket) {
        var xhr = new XMLHttpRequest();
        var openFullView = new OpenFullPageWorkspaceView();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              deferred.resolve();
            }
            else {
              deferred.reject(lang.failedAuthentication + new Error(xhr.statusText));
            }
          }
        };
        openFullView.authenticate(xhr, cgiUrl, this.connector);

      } else {
        this.options.context.once("sync", function () {
          that.authenticateXecm(cgiUrl, deferred);
        });
      }
      return deferred.promise();
    },

    onShow: function () {
      var options = this.options || {},
          status  = options.status || {};

      this.connector = this.options.context.getObject(ConnectorFactory);
      // SAPRM-8688: Improve navigation by a back button
      var require                      = window.csui && window.csui.require || window.require,
          commands                     = options.data && options.data.folderBrowserWidget &&
                                         options.data.folderBrowserWidget.commands || {},
          goToNodeHistory              = commands['go.to.node.history'] || {},
          goToNodeHistoryEnabled       = !_.isUndefined(goToNodeHistory.enabled) ?
                                         goToNodeHistory.enabled : true,

          openFullPageWorkspace        = commands['open.full.page.workspace'] || {},
          openFullPageWorkspaceEnabled = !_.isUndefined(openFullPageWorkspace.enabled) ?
                                         openFullPageWorkspace.enabled : true,
          fullPageOverlayEnabled       = !_.isUndefined(openFullPageWorkspace.fullPageOverlay) ?
                                         openFullPageWorkspace.fullPageOverlay : true,
          // SAPRM-9805
          // if viewMode is not set we show folderBrowserWidget ( = default )
          // if viewMode is 'fullPage' we show the perspective ( = page ) view
          viewMode                     = options.data.viewMode ? options.data.viewMode.mode :
                                         'folderBrowse',
          searchContainer              = commands['search.container'] || {},
          searchContainerEnabled       = !_.isUndefined(searchContainer.enabled) ?
                                         searchContainer.enabled : true;

      if (viewMode === 'fullPage') {

        this.cgiUrl = this.connector && this.connector.connection && this.connector.connection.url ?
                      this.connector.connection.url.replace('/api/v1', '') : '';
        var that = this;
        this.authenticateXecm(this.cgiUrl)
            .done(function () {

              csui.require(['xecmpf/widgets/integration/folderbrowse/full.page.workspace.view',
                    'csui/utils/url'
                  ],
                  function (FullPageWorkspaceView, Url) {

                    var urlPrefix            = 'xecm',
                        queryParams          = "where_ext_system_id=" +
                                               options.data.extSystemId +
                                               "&where_bo_type=" +
                                               options.data.busObjectType +
                                               "&where_bo_id=" +
                                               options.data.busObjectId + "&view_mode=" +
                                               options.data.viewMode.mode,
                        fullPageWorkspaceUrl = Url.appendQuery(
                            Url.combine(that.cgiUrl, urlPrefix, 'nodes',
                                status.workspaceNode.attributes.id), queryParams),
                        fullPageWorkspaceView,
                        currentWindowRef     = window,
                        themePath            = $(currentWindowRef.document).find(
                            "head > link[data-csui-theme-overrides]").attr('href'),
                        setTheme             = function (e) {
                          if (e.origin &&
                              (new RegExp(e.origin, "i").test(new Url(that.cgiUrl).getOrigin()))) {
                            if (e.data) {
                              if (e.data.status === "ok") {
                                e.source.postMessage({"themePath": themePath}, that.cgiUrl);
                                currentWindowRef.removeEventListener("message", setTheme, false);
                              }
                            }
                          }
                        };
                    csui.require.config({
                      config: {
                        'csui/integration/folderbrowser/commands/go.to.node.history': {
                          enabled: true
                        }
                      }
                    });
                    fullPageWorkspaceView = new FullPageWorkspaceView({
                      fullPageWorkspaceUrl: fullPageWorkspaceUrl,
                      connector: that.connector
                    });
                    that.content.show(fullPageWorkspaceView);
                    currentWindowRef.addEventListener("message", setTheme);

                  },
                  function (error) {
                    ModalAlert.showError(error.toString());
                    console.error(error);
                  }
              );
            })
            .fail(function (error) {
              ModalAlert.showError(error.toString());
              console.error(error);
            });
      }
      else {

        csui.require.config({
          config: {
            'csui/integration/folderbrowser/commands/go.to.node.history': {
              enabled: goToNodeHistoryEnabled
            }
          }
        });
        // SAPRM-8746: SAP users wants to search from here
        // SAPRM-8752: SAP users wants to open the full page workspace
        csui.require.config({
          config: {
            'xecmpf/utils/commands/folderbrowse/search.container': {
              enabled: searchContainerEnabled
            },
            'xecmpf/utils/commands/folderbrowse/open.full.page.workspace': {
              enabled: openFullPageWorkspaceEnabled,
              fullPageOverlay: fullPageOverlayEnabled
            }
          }
        });

        // SAPRM-9153
        // Remove default delete command of csui.core and add
        // our own bus. wksp. delete command
        // bus. wksp. delete command displays create/complete widget after
        // deletion of bus. wksp., but displays parent of deleted item for
        // all other CS items
        var del = CsuiCommands.get('Delete');
        if (del) {
          CsuiCommands.remove(del);
        }
        options.data.id = status.workspaceNode.attributes.id;
        options.data.viewMode = viewMode;
        options.data.openFullPageWorkspaceEnabled = openFullPageWorkspaceEnabled;
        options.data.fullPageOverlayEnabled = fullPageOverlayEnabled;
        options.data.goToNodeHistoryEnabled = goToNodeHistoryEnabled;
        var busWkspDeleteCmd = new WkspDeleteCmd(options.data);
        CsuiCommands.add(busWkspDeleteCmd);
        // End of SAPRM-9153

        // SAPRM-9977
        this.options.context.options.suppressReferencePanel = true;
        // End of SAPRM-9977

        // Create the widget attached to the placeholder HTML element.
        this.browser = new FolderBrowserWidget({
          breadcrumb: !goToNodeHistoryEnabled,
          connection: this.connector.connection,
          start: {id: status.workspaceNode.attributes.id},
          // SAPRM-9977
          context: this.options.context
          // End of SAPRM-9977
        });
        // Display the widget.
        this.browser.show({

          // Placeholder is mandatory, but can be passed to the show
          // method first, because it is needed first for rendering.
          placeholder: "#display_wksp_content"
        });
      }
    }
  });
  return DisplayWorkspaceView;
});

csui.define('xecmpf/widgets/workspaces/pages/update.workspace/impl/nls/lang',{
    // Always load the root bundle for the default locale (en-us)
    "root": true,
    // Do not load English locale bundle provided by the root bundle
    "en-us": false,
    "en": false
});

csui.define('xecmpf/widgets/workspaces/pages/update.workspace/impl/nls/root/lang',{
    pageTitle: 'Complete workspace',
    completeWorkspace: 'Complete',
    completeWorkspaceTooltip: 'Complete workspace',
    failedToUpdateItem: 'Failed to update the item.',
    cancel: 'Cancel',
    nameIsGeneratedAutomatically: 'Workspace name is generated automatically.',
    errorGettingCreateForm: 'Error getting form for workspace creation.'
});



/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/workspaces/pages/update.workspace/impl/update.workspace',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"content\" class=\"cs-properties-wrapper\"></div>\r\n<div id=\"footer\"></div>\r\n\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_workspaces_pages_update.workspace_impl_update.workspace', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/workspaces/pages/update.workspace/impl/update.workspace',[],function(){});
/**
 * Created by cknoblic on 08.09.2016.
 */
csui.define('xecmpf/widgets/workspaces/pages/update.workspace/update.workspace.view',['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/log',
    'csui/utils/base',
    'xecmpf/widgets/workspaces/controls/tile/tile.view',
    'xecmpf/widgets/workspaces/controls/footer/footer.view',
    "csui/widgets/metadata/metadata.properties.view",
    'csui/widgets/metadata/metadata.action.one.item.properties.view',
    'csui/models/node/node.model',
    'csui/utils/contexts/factories/connector',
    'csui/dialogs/modal.alert/modal.alert',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/behaviors/keyboard.navigation/tabables.behavior',
    'csui/utils/url',
    'conws/models/workspacecreateforms',
    'i18n!xecmpf/widgets/workspaces/pages/update.workspace/impl/nls/lang',
    'hbs!xecmpf/widgets/workspaces/pages/update.workspace/impl/update.workspace',
    'css!xecmpf/widgets/workspaces/pages/update.workspace/impl/update.workspace'

], function (module, $, _, Backbone, Marionette, log, base,
             TileView,
             FooterView,
             MetadataPropertiesView,
             MetadataActionOneItemPropertiesView,
             NodeModel,
             ConnectorFactory,
             ModalAlert,
             LayoutViewEventsPropagationMixin,
             TabablesBehavior,
             Url,
             WorkspaceCreateFormCollection,
             lang,
             template,
             css) {


    var UpdateWorkspaceView = Marionette.LayoutView.extend({

        tagName: "div",
        id: "xecmpf-update_wksp",
        className: "xecmpf-page",

        template: template,
        regions: {
            content: "#content",
            footer: "#footer"
        },

        behaviors: {
            TabablesBehavior: {
                behaviorClass: TabablesBehavior,
                recursiveNavigation: true,
                containTabFocus: true
            }
        },

        constructor: function UpdateWorkspaceView(options) {
            var self = this;
            Marionette.LayoutView.prototype.constructor.apply(this, arguments);
            this.context = this.options.context || {};
            this.propagateEventsToRegions();
            this.readOnlyCats = {};
            this.readOnlyCatVals = {};
            // FIXME keyboard keydown event is registered twice see LPAD-54770
            this.on('dom:refresh', function () {
                if ($._data) {
                    var events = $._data(this.el, "events");
                    if (events && events.keydown && events.keydown.length > 1) {
                        var eventName = !_.isEmpty(events.keydown[1].namespace) ?
                            events.keydown[1].type + '.' + events.keydown[1].namespace : events.keydown[1].type;
                        eventName && events.keydown[1].handler && self.$el.off(eventName, events.keydown[1].handler)
                    }
                }
            });
            var readOnlyCats = this.readOnlyCats,
                readOnlyCatVals = this.readOnlyCatVals;

            this._saveField = function (args) {
                // This view is shared for both creation and editing scenarios.
                // Do not save immediately in the creation mode.  The creation dialog
                // has a button to get all field values and perform the action.
                if (this.mode === 'create') {
                    return;
                }


                // _.chain(this.model.get('schema').properties['52238_2'].properties)

                // Optimizing the payload to send a part of the category, which has to
                // be complete, is complicated.  The classic UI sends all data anyway.
                // Until we have PATCH behaviour in the REST API, it doesn't pay off.
                var values = this.getValues(),
                    self = this;

                // Savechanges should be invoked only for the current category which is being edited. 
                // Hence take the current category id into a var and compare while setting the attribute values.
                var currentId = this.model.get("id");

                // this.model.get('schema')
                _.chain(readOnlyCats).each(function (readOnlyCatModel, id) { // => id = 'catgpory => 52238'

                    // if the category being edited is not the workspace category, 
                    //continue the loop without processing.

                    if  ( (currentId !== undefined) &&  (currentId !== id) ){
                        return true;
                    }

                    // check readonly fields in category
                    _.chain(readOnlyCatModel.properties).each(function (schemaDef, key) { // key =>52238_2
                        if (schemaDef.type === 'object') {
                            // id == Cat Id => sets
                            _.chain(schemaDef.properties).each(function (setFieldDef, setFieldKey) { // setFieldKey => "52238_2_1_6"
                                if (setFieldDef.readonly === true) {
                                    values[key][setFieldKey] = readOnlyCatVals[id + ':' + key + ':' + setFieldKey];
                                }
                            })
                        } else if (schemaDef.type === 'array' && _.has(schemaDef, 'items')) {
                            var tabProps = schemaDef.items.properties;
                            _.chain(tabProps).each(
                                function (tabField, tabKey) { //  tabkey => 34359_9_x_10
                                    if (tabField.readonly === true) {
                                        _.chain(values[key]).each(function (tableRow, index) {
                                            var readOnlyVal = readOnlyCatVals[id + ':' + key + ':' +  index + ':' + tabKey];
                                            if (!_.isUndefined(readOnlyVal)) {
                                                tableRow[tabKey] = readOnlyVal;
                                            }
                                        });
                                    }
                                })

                        } else if (schemaDef.readonly === true) { // simple or array type
                            values[key] = readOnlyCatVals[id + ':' + key];
                        }
                    })
                })

                this._saveChanges(values);
            }
        },
        _getController: function () {
            return this.options.status.wksp_controller;
        },
        _createFormCollection: function () {
            var self = this,
                options = this.options || {},
                context = options.context,
                status = options.status,
                workspace = status.workspace;

            // options required by constructor
            this.formCollection = new WorkspaceCreateFormCollection(undefined,
                _.defaults(options, {
                    type: workspace.get("type"),
                    wsType: workspace.get("wnf_wksp_type_id"),
                    node: new NodeModel(undefined, {
                            // node model collection needs connector
                            connector: context.getObject(ConnectorFactory)
                        }
                    )
                }));

            // bo_id is set externally
            this.formCollection.bo_id = options.data.busObjectId;
            this.formCollection.url = function () {

                var path = 'forms/businessworkspaces/create',
                    params = {
                        template_id: workspace.get("wnf_wksp_template_id"),
                        parent_id: workspace.get("parent_id"),
                        ext_system_id: options.data.extSystemId,
                        bo_type: options.data.busObjectType,
                        bo_id: options.data.busObjectId,
                        completeWorkspace: true
                    },
                    resource = path + '?' + $.param(_.omit(params, function (value) {
                            return value === null || value === undefined || value === '';
                        })),
                    url = context.getObject(ConnectorFactory).connection.url;
                return Url.combine(url && url.replace('/v1', '/v2') || url, resource);
            };

            this.formCollection.on("error", function (model, response, options) {
                var errmsg = response && (new base.Error(response)).message || lang.errorGettingCreateForm;
                log.error("Fetching the create forms failed: {0}", errmsg) && console.error(log.last);
                ModalAlert.showError(errmsg);
            });

        },
        _updateWorkspaceReference: function (model, formsValues) {
            // FormData available (IE10+, WebKit)
            var formData = new FormData();
            formData.append('body', JSON.stringify(formsValues));

            var options = {
                type: 'PUT',
                url: Url.combine(model.connector.connection.url.replace('/v1', '/v2'),
                    'businessworkspaces', model.get("id"), 'workspacereferences'),
                data: formData,
                contentType: false,
                processData: false
            };
            model.connector.extendAjaxOptions(options);
            return $.ajax(options);
        },
        _complete: function (options) {
            var self = this,
                data = this.tileView.contentView.getValues(),
                dfd = $.Deferred();

            if (!_.isEmpty(data)) {
                var context = options.context || {},
                    status = options.status,
                    workspace = status.workspace;

                self._updateWorkspaceReference(
                    new NodeModel({
                        id: workspace.get("id")
                    }, {
                        // node model collection needs connector
                        connector: context.getObject(ConnectorFactory)
                    }),
                    {
                        bo_type: self.getOption("data").busObjectType,
                        bo_id: self.getOption("data").busObjectId,
                        ext_system_id: self.getOption("data").extSystemId
                    }).done(_.bind(function (resp) {
                    dfd.resolve();
                    if (resp) {
                        _.extend(status, {
                            workspaceNode: new NodeModel({
                                id: workspace.get("id"),
                                container: true
                            }),
                            viewMode: {
                                mode: options.data.viewMode ? options.data.viewMode.mode : 'folderBrowse'
                            }
                        });

                        self._getController().displayWorkspace(options);
                    }
                }, this))
                    .fail(function (resp) {
                        var error = lang.failedToUpdateItem;
                        if (resp) {
                            if (resp.responseJSON && resp.responseJSON.error) {
                                error = resp.responseJSON.error;
                            } else if (resp.responseText) {
                                error = resp.responseText;
                            }
                            ModalAlert.showError(error);
                        }
                        dfd.reject();
                    });
            }
            else {
                // Position to field with error message
                $('.binf-has-error') && $('.binf-has-error')[0].scrollIntoView()
                dfd.reject();
            }

            return dfd.promise();
        },
        _setHeader: function (model) {
            // we have special behavior for the name field, depending on the forms result.
            // so we put the code here, where we have access to the name field in the dialog header.
            var general = this.formCollection.at(0);
            var data = general.get("data");
            if (data) {
                var name = data.name,
                    self = this;
                log.debug("name fetched and used: {0}", name) && console.log(log.last);
                this.node.set("name", name);
            } else {
                // if no server data object is set, then we set an empty name.
                log.debug("name set to empty.") && console.log(log.last);
                this.node.set("name", "");
            }

            var headerView = this.tileView.contentView.metadataHeaderView,
                nameView = headerView && headerView.metadataItemNameView;

            if (nameView) {
                var gs = general.get("schema"),
                    isReadOnly = (gs && gs.properties && gs.properties.name && gs.properties.name.readonly) ? true : false,
                    placeHolder = isReadOnly ? lang.nameIsGeneratedAutomatically : undefined;
                nameView.setPlaceHolder(placeHolder);
                if ((isReadOnly ? true : false) !== (nameView.readonly ? true : false)) {
                    nameView.setReadOnly(isReadOnly);
                }
                nameView.stopListening(this.node);
            }
        },
        _updateModel: function (model) {
            var self = this;
            this._setHeader(model);
            if (model) {
                // each form model represents a tab e.g. 'general', 'categories' (with all categories) or 'classifications'
                // model is 'general' or applied category form (with ONE category)
                this.formCollection.models.forEach(function (formModel) {
                    // each form model consist
                    var formData = formModel.get("data"),
                        formSchema = formModel.get("schema");

                    // formSchema: 51806, 52238 (all categories)
                    if (_.has(formSchema.properties, model.get("id"))) { // =>52238

                        // get schema def from create form
                        var modelId = model.get("id"),  // =>52238
                            origModelSchema = model.get("schema"),
                            formSchemaDef = formSchema.properties[modelId];

                        formModel = formData[modelId];
                        // check all form model fields against original model
                        _.chain(formSchemaDef.properties).each(
                            function (field, key, list) { // key =>52238_2

                                // check  form model field against original model
                                if (_.has(origModelSchema.properties, key)) {  // 'catgpory => 52238'  key =>52238_2
                                    var formProps = field.properties,
                                        // no data in model? Should not happen?
                                        origModelData = model.get("data")[key],
                                        origModelFieldSchema = origModelSchema.properties[key],
                                        formModelData = formModel[key];

                                    // sets
                                    if (field.type === 'object') {
                                        var origModelSetSchema = origModelFieldSchema.properties;
                                        _.chain(formProps).each(
                                            function (setField, setFieldKey) { //  setFieldKey => "52238_2_1_6"
                                                if (setField.readonly === true) {
                                                    origModelSetSchema[setFieldKey].readonly = setField.readonly;
                                                    self.readOnlyCatVals[modelId + ':' + key + ':' + setFieldKey] = origModelData[setFieldKey];
                                                    self.readOnlyCats[modelId] = origModelSchema;
                                                    origModelData[setFieldKey] = formModelData[setFieldKey];
                                                }
                                            })
                                    }
                                    else if (field.type === 'array' && _.has(field, 'items')) {
                                        var formTabularProps = field.items.properties,
                                            origModelTabSchema = origModelFieldSchema.items.properties;

                                        _.chain(formTabularProps).each(
                                            function (tabField, tabKey) { //  tabkey => 34359_9_x_10
                                                if (tabField.readonly === true) {
                                                    origModelTabSchema[tabKey].readonly = tabField.readonly;

                                                    _.chain(formModelData).each(function (tableRow, index) {
                                                        // orig model can have less entries
                                                        origModelData[index] || (origModelData[index] = {});
                                                        self.readOnlyCatVals[modelId + ':' + key + ':' + index + ':' + tabKey] =
                                                            origModelData[index][tabKey];
                                                        origModelData[index][tabKey] = tableRow[tabKey]
                                                    });

                                                    self.readOnlyCats[modelId] = origModelSchema;
                                                }
                                            })


                                    }
                                    else if (field.readonly) { // simple/array field type string
                                        origModelFieldSchema.readonly = field.readonly;
                                        self.readOnlyCatVals[modelId + ':' + key] = origModelData;
                                        self.readOnlyCats[modelId] = origModelSchema;
                                        model.get("data")[key] = formModelData;
                                    }
                                }
                            }
                        );
                    }
                });
            }
        },
        fetchForm: function () {
            this._createFormCollection();
            return this.formCollection.fetch();
        },
        render: function () {
            var self = this,
                status = this.options.status,
                workspace = status.workspace,
                buttonCollecion = new Backbone.Collection([
                    {
                        click: _.bind(this._complete, this, this.options),
                        disabled: true, primary: false,
                        label: lang.completeWorkspace, toolTip: lang.completeWorkspaceTooltip
                    },
                    {
                        click: _.bind(function () {
                            var dfd = $.Deferred();
                            this._getController().selectWorkspace();
                            dfd.resolve();
                            return dfd.promise()
                        }, this, this.options),
                        disabled: true, primary: false, toolTip: lang.cancel,
                        label: lang.cancel, separate: false
                    }
                ]);

            Marionette.LayoutView.prototype.render.apply(this, arguments);

            this.node = new NodeModel({
                    type_name: workspace.get("type_name"),
                    type: workspace.get("type"),
                    name: workspace.get("name"),
                    id: workspace.get("id"),
                    container: true
                },
                {
                    connector: this.context.getObject(ConnectorFactory)
                }
            );

            // adjust model with data from business object
            var CompleteMetadataPropertiesView = MetadataPropertiesView.extend({
                contentViewOptions: function (model) {
                    self._updateModel(model)
                    return MetadataPropertiesView.prototype.contentViewOptions.apply(this, arguments);
                }
            });

            var UpdatePropertiesView = MetadataActionOneItemPropertiesView.extend({
                    constructor: function UpdatePropertiesView(options) {
                        MetadataActionOneItemPropertiesView.prototype.constructor.apply(this, arguments);
                        if (this.metadataPropertiesView !== undefined) {
                            this.metadataPropertiesView.stopListening(this);
                        }
                        this.metadataPropertiesView = new CompleteMetadataPropertiesView({
                            node: self.node,
                            context: self.options.context,
                            formMode: 'update',
                            action: 'update',
                            metadataView: this
                        });


                        this.listenTo(this.metadataPropertiesView, 'render:forms', function () {
                            buttonCollecion.at(0).set('disabled', false);
                            buttonCollecion.at(1).set('disabled', false);
                            buttonCollecion.at(0).set('primary', true);
                            self.footerView.update();
                            this.metadataPropertiesView.tabContent.children.each(function(child, key) {
                                if (child.model.get('role_name') === 'categories') {
                                    // remove change field connected to prototype
                                    child.content.off('change:field');
                                    child.content._saveField = function(args) {
                                        self._saveField.apply(this,args);
                                    }
                                    child.content.listenTo(child.content, 'change:field', child.content._saveField);

                                }
                            })
                        });

                        // remove conws reference panel
                        this.listenTo(this.metadataPropertiesView, 'before:render',
                            function () {
                                var conwsRef = this.metadataPropertiesView.collection.findWhere({id: "conws-reference"});
                                if (conwsRef) {
                                    this.metadataPropertiesView.collection.remove(conwsRef, {silent: true});
                                }
                            });
                    }
                }
            );

            // must be displayed immediately
            this.footerView = new FooterView({
                collection: buttonCollecion
            });

            this.tileView = new TileView({
                title: lang.pageTitle,
                contentView: UpdatePropertiesView,
                contentViewOptions: {
                    model: this.node,
                    context: this.options.context,
                    action: 'update'
                }
            });


        },
        onBeforeShow: function () {
            this.content.show(this.tileView);
            this.footer.show(this.footerView);
        }
    });
    _.extend(UpdateWorkspaceView.prototype, LayoutViewEventsPropagationMixin);
    return UpdateWorkspaceView;
});


csui.define('xecmpf/widgets/workspaces/controllers/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/workspaces/controllers/impl/nls/root/lang',{
    errorGettingBusinessWorkspaceType: 'Cannot get business workspace type.'
});


csui.define('xecmpf/widgets/workspaces/controllers/dialog.controller',['require',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/lib/marionette',
    'csui/lib/backbone',
    'xecmpf/widgets/workspaces/pages/select.workspace/select.workspace.view',
    'xecmpf/widgets/workspaces/pages/create.workspace/create.workspace.view',
    'xecmpf/widgets/workspaces/pages/display.workspace/display.workspace.view',
    'xecmpf/widgets/workspaces/pages/update.workspace/update.workspace.view',
    'xecmpf/widgets/workspaces/factories/workspace.factory',
    'xecmpf/widgets/workspaces/factories/workspace.types.factory',

    'conws/models/workspacecreateforms',

    'csui/utils/contexts/factories/connector',
    "csui/models/node/node.model",
    'csui/dialogs/modal.alert/modal.alert',

    'i18n!xecmpf/widgets/workspaces/controllers/impl/nls/lang'
], function (require, $, _,
    Marionette, Backbone,
    SelectWorkspaceView,
    CreateWorkspaceView,
    DisplayWorkspaceView,
    UpdateWorkspaceView,
    WorkspacesCollectionFactory,
    WorkspaceTypeCollectionFactory,
    WorkspaceCreateFormCollection,

    ConnectorFactory,
    NodeModel,
    ModalAlert,
    lang) {


    var DialogController = Marionette.Object.extend({

        constructor: function DialogController(options) {
            options = options || {};
            this.options = options;
            this.context = this.options.context || {};
            this.region = this.options.region;
        },
        updateWorkspace: function (options) {
            options || (options = this.options);
            this._showUpdateWorkspaceView(options);
        },
        displayWorkspace: function (options) {
            options || (options = this.options);
            this._showDisplayWorkspaceView(options);
        },
        createWorkspace: function (options) {
            options || (options = this.options);
            this._showCreateWorkspaceView(options);
        },
        selectWorkspace: function (options) {
            options || (options = this.options);
            options.status || (options.status = {});

            var context = options.context,
                data = options.data,
                that = this,
                promises = [];

            this._getBOWorkspace(context, data)
                .done(function (boWorkspace) {
                    if (boWorkspace) {
                        _.defaults(options.status, {
                            workspaceNode: boWorkspace,
                            viewMode: {
                                mode: data.viewMode ? data.viewMode.mode : 'folderBrowse'
                            }
                        });
                        that.displayWorkspace(options);
                    } else {
                        promises.push(that._getBOEarlyWorkspaces(context, data));
                        promises.push(that._getBOWorkspaceType(context, data));
                        $.when.apply($, promises)
                            .done(function (boEarlyWorkspaces, boWorkspaceType) {
                                if (boEarlyWorkspaces && !!boEarlyWorkspaces.length) {
                                    that._showSelectWorkspaceView(options);
                                } else {
                                    _.defaults(options.status, {
                                        workspaceType: new Backbone.Model({
                                            wksp_type_name: boWorkspaceType.get('wksp_type_name'),
                                            wksp_type_id: boWorkspaceType.get('wksp_type_id'),
                                            rm_enabled: boWorkspaceType.get('rm_enabled'),
                                            template: boWorkspaceType.get('templates')[0],
                                            type: 848
                                        }),
                                        mode: 'directCreate'
                                    });
                                    that._showCreateWorkspaceView(options);
                                }
                            })
                            .fail(function (jqXHR, statusText, error) {
                                if (jqXHR) {
                                    if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                                        ModalAlert.showError(lang.errorGettingBusinessWorkspaceType + ' ' + jqXHR.responseJSON.error);
                                    } else {
                                        ModalAlert.showError(lang.errorGettingBusinessWorkspaceType);
                                    }
                                }
                            });
                    }
                })
                .fail(function (jqXHR, statusText, error) {
                    if (jqXHR) {
                        if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                            ModalAlert.showError(lang.errorGettingBusinessWorkspaceType + ' ' + jqXHR.responseJSON.error);
                        } else {
                            ModalAlert.showError(lang.errorGettingBusinessWorkspaceType);
                        }
                    }
                });
        },

        _showCreateWorkspaceView: function (options) {
            this.region.show(new CreateWorkspaceView(options));
        },
        _showDisplayWorkspaceView: function (options) {
            this.region.show(new DisplayWorkspaceView(options));
        },
        _showUpdateWorkspaceView: function (options) {
            var updateView = new UpdateWorkspaceView(options),
                self = this;
            updateView.fetchForm().done(function () {
                self.region.show(updateView);
            });
        },
        _showSelectWorkspaceView: function (options) {
            this.region.show(new SelectWorkspaceView(options));
        },

        _getBOWorkspace: function (context, data) {
            var deferred = $.Deferred();
            var boWorkspace = false;
            // if 'workspaceNodeId' property is present, the existance of CS workspace for the BO is already checked
            if (data.hasOwnProperty('workspaceNodeId')) {
                if (!!data['workspaceNodeId']) {
                    boWorkspace = new NodeModel({
                        id: data.workspaceNodeId,
                        container: true
                    })
                }
                deferred.resolve(boWorkspace);
            }
            // else check the existance of CS workspace for the BO
            else {
                var collection = context.getCollection(WorkspacesCollectionFactory, {
                    attributes: data.busObjectId,
                    busObjectId: data.busObjectId,
                    busObjectType: data.busObjectType,
                    extSystemId: data.extSystemId,
                    detached: true // fetching manually
                });
                collection.ensureFetched()
                    .done(function () {
                        if (collection.length === 1) {
                            boWorkspace = new NodeModel({
                                id: collection.at(0).get('id'),
                                container: true
                            });
                        }
                        deferred.resolve(boWorkspace);
                    })
                    .fail(function () {
                        deferred.reject.apply(deferred, arguments);
                    });
            }
            return deferred;
        },
        _getBOEarlyWorkspaces: function (context, data) {
            var deferred = $.Deferred();
            var collection = context.getCollection(WorkspacesCollectionFactory, {
                attributes: 'early',
                early: true,
                busObjectType: data.busObjectType,
                extSystemId: data.extSystemId,
                detached: true // fetching manually
            });

            var promise;
            // if BO Workspace is deleted, then fetch the early workspaces from server again
            if (data.deletecallback) {
                promise = collection.fetch();
            } else {
                promise = collection.ensureFetched();
            }

            promise
                .done(function () {
                    deferred.resolve(collection);
                })
                .fail(function () {
                    deferred.reject.apply(deferred, arguments);
                });
            return deferred;
        },
        _getBOWorkspaceType: function (context, data) {
            var deferred = $.Deferred();
            var boWorkspaceType = false;
            var collection = context.getCollection(WorkspaceTypeCollectionFactory, {
                busObjectType: data.busObjectType,
                extSystemId: data.extSystemId,
                detached: true // fetching manually
            });
            collection.ensureFetched()
                .done(function () {
                    if (collection.at(0).get('templates').length === 1) {
                        boWorkspaceType = collection.at(0);
                    }
                    deferred.resolve(boWorkspaceType);
                })
                .fail(function () {
                    deferred.reject.apply(deferred, arguments);
                });

            return deferred;
        }
    });

    return DialogController;
});
csui.define('xecmpf/widgets/workspaces/routers/dialog.router',['require',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/lib/marionette',
    'xecmpf/widgets/workspaces/controllers/dialog.controller'
], function (require, $, _,
             Marionette,
             DialogController) {

    var DialogRouter = Marionette.AppRouter.extend({

        appRoutes: {
            "": "selectWorkspace",
            "updateWorkspace/": "updateWorkspace",
            "selectWorkspace/": "selectWorkspace",
            "displayWorkspace/": "displayWorkspace",
            "newWorkspace/": "createWorkspace"
        },

        constructor: function DialogRouter(options) {
            this.controller = new DialogController(options);
            Marionette.AppRouter.prototype.constructor.apply(this, arguments);

        },
        execute: function (callback, args, name) {
            if (callback) {
                callback.apply(this, args);
            }
        }

    });

    return DialogRouter;
});


/**
 * Created by cknoblic on 04.10.2016.
 */

csui.define('xecmpf/widgets/workspaces/utils/urlhelper',['module',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/utils/log',
    'csui/utils/base'
], function (module, $, _, log, base) {

    var UrlHelper = {

        getParams: function (location) {
            return location.search.replace('?', '').split('&').reduce(
                function (s, c) {
                    var t = c.split('=');
                    s[t[0].toLowerCase()] = t[1];
                    return s;
                },
                {});
        },
    }
    return UrlHelper;
});

/**
 * Created by cknoblic on 28.09.2016.
 */

csui.define('xecmpf/widgets/workspaces/workspaces.widget',["module", "require", "csui/lib/jquery", "csui/lib/underscore",
  "csui/lib/marionette", "csui/utils/log",
  "csui/lib/backbone",
  'xecmpf/widgets/workspaces/routers/dialog.router',
  'xecmpf/widgets/workspaces/controllers/dialog.controller',
  'xecmpf/widgets/workspaces/utils/urlhelper',
  'csui/utils/contexts/factories/connector',
  'csui/utils/contexts/factories/user',
  'xecmpf/widgets/workspaces/pages/select.workspace/select.workspace.view'
], function (module, _require, $, _, Marionette, log,
    Backbone,
    DialogRouter,
    DialogController,
    UrlHelper,
    ConnectorFactory,
    UserModelFactory,
    SelectWorkspaceView) {

  var SlideTransitionRegion = Backbone.Marionette.Region.extend({

    show: function (view) {
      this._ensureElement();
      view.render();
      this.close(function () {
        this.currentView = view;
        this.open(view, function () {
          if (view instanceof SelectWorkspaceView) {
            Marionette.triggerMethodOn(view, 'show');
          }
        });
      });

    },
    // slide out
    close: function (cbOpen) {
      var view = this.currentView,
          that = this;

      delete this.currentView;
      // there is only one view  ==> display it
      if (!view) {
        if (cbOpen) {
          cbOpen.call(this);
        }
        return;
      }
      // close "old" view
      view.$el.hide('slide', {
        direction: 'left',
        complete: function () {

          if (view.destroy) {
            view.destroy();
          }
          // ==> display new view
          if (cbOpen) {
            cbOpen.call(that);
          }
        }
      }, 250);

    },
    // slide in
    open: function (view, cbDomRefresh) {
      var that = this;
      this.$el.hide();

      this.$el.html(view.$el);

      Marionette.triggerMethodOn(view, 'before:show');
      Marionette.triggerMethodOn(view, 'show');
      Marionette.triggerMethodOn(view, 'dom:refresh');

      this.$el.show('slide', {
        direction: 'right',
        complete: function () {
          if (cbDomRefresh) {
            cbDomRefresh.call(that);
          }
        }

      }, 250);
    }
  });

  function CompleteCreateWorkspaceWidget(options) {
    options || (options = {});
    var params = UrlHelper.getParams(window.location);
    if (_.isEmpty(options.data) && !_.isEmpty(params)) {
      this.options = _.defaults({}, options,
          {
            data: {
              busObjectId: params.busobjectid,
              busObjectType: params.busobjecttype,
              extSystemId: params.extsystemid
            }
          }
      );
    } else {
      this.options = options;
    }

    this.options.context.user = this.options.context.getModel(UserModelFactory);

  }

  _.extend(CompleteCreateWorkspaceWidget.prototype, {

    show: function (options) {
      var that = this;
      var receiveMessage = function (event) {
        try {
          var connector  = that.options.context.getObject(ConnectorFactory),
              connection = connector.getConnectionUrl()/*,
                        urlProtocol          = connection.getProtocol(),
                        urlHost              = connection.getHost(),
                        urlOrigin            = urlProtocol + '://' + urlHost*/;
          if (connection.getOrigin().toLowerCase() === event.origin.toLowerCase()) {
            // from workspace.delete.js we get a string
            if (typeof event.data === 'string' || event.data instanceof String) {
              var callbackOptions = JSON.parse(event.data);
              if (callbackOptions.busObjectId &&
                  callbackOptions.busObjectType &&
                  callbackOptions.extSystemId) {
                $("#xecm-full-page-frame").remove();
                callbackOptions.deletecallback = true;
                that.showView(that, callbackOptions);
              }
            }
          }
        } catch (e) {
          console.log(event);
        }
      };
      window.addEventListener("message", receiveMessage, false);
      this.showView(this, options);
    },

    showView: function (self, options) {
      if (!self.region) {
        self.region = new SlideTransitionRegion({el: options.placeholder});
      }
      _.defaults(self.options, options, {
        region: self.region
      });
      self.options.status = self.options.status || {};
      // dialog controller
      _.defaults(self.options.status, {
        wksp_controller: new DialogController(self.options)
      });
      self.options.status.wksp_controller.selectWorkspace(self.options);
    }
  });

  CompleteCreateWorkspaceWidget.version = '1.0';
  return CompleteCreateWorkspaceWidget;
});


// Lists explicit locale mappings and fallbacks
csui.define('xecmpf/widgets/myattachments/nls/myattachments.lang',{
    // Always load the root bundle for the default locale (en-us)
    "root": true,
    // Do not load English locale bundle provided by the root bundle
    "en-us": false,
    "en": false,    
});

//define({ "root": true });

// Defines localizable strings in the default language (English)
csui.define('xecmpf/widgets/myattachments/nls/root/myattachments.lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false,
  "attachmentsTabTitle": "Business Objects",
  "ErrorLoadingAddItemMenu": 'Cannot load business object types to the Add menu.',
  "DetachBusinessAttachment": "Detach",
  "GoToWorkspace":            "Go to Workspace",
  "OpenSapObject":            "Display",
  "AddBusinessAttachment":    "Add Business Object",
  "ErrorCreatingBusAttachment":  "Cannot create business attachment.",
  "BOSearchTitle":             "Search business objects",
  "noBusinessAttachmentsAvailable": "Add business objects to this Content Server item."
});


csui.define('xecmpf/utils/commands/myattachments/detach_myattachment',['module', 'csui/models/command',
    'csui/utils/commandhelper',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/utils/commands/confirmable',
    'csui/utils/command.error',
    'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, CommandModel, CommandHelper, $, _, ConfirmableCommand, CommandError, lang) {
    'use strict';

    var messageHelper;
    var globalMessage;
    var base;
    var globals = {};

    // Dependencies initialized during execution

    var DetachAttachmentCommand = CommandModel.extend({

        defaults: {
            signature: 'detach_business_attachment',
            command_key: ['detach_business_attachment'],
            name: lang.CommandNameDetach,
            pageLeavingWarning: lang.DetachPageLeavingWarning,
            scope: 'multiple',
            doneVerb: lang.CommandDoneVerbDetached,
            successMessages: {
                formatForNone: lang.DetachBusAttsNoneMessage,
                formatForOne: lang.DetachOneBusAttSuccessMessage,
                formatForTwo: lang.DetachSomeBusAttsSuccessMessage,
                formatForFive: lang.DetachManyBusAttsSuccessMessage
            },
            errorMessages: {
                formatForNone: lang.DetachBusAttsNoneMessage,
                formatForOne: lang.DetachOneBusAttFailMessage,
                formatForTwo: lang.DetachSomeBusAttsFailMessage,
                formatForFive: lang.DetachManyBusAttsFailMessage
            }
        },

        _getConfirmTemplate: function (status, options) {
            return _.template("<span class='msgIcon WarningIcon'><%- message %></span>");
        },

        _getConfirmData: function (status, options) {
            var nodes = CommandHelper.getAtLeastOneNode(status);
            return {
                title: lang.DetachBusAttsCommandConfirmDialogTitle,
                message: nodes.length === 1 ?
                    _.str.sformat(lang.DetachBusAttsCommandConfirmDialogSingleMessage,
                        nodes.at(0).get('name')) :
                    _.str.sformat(lang.DetachBusAttsCommandConfirmDialogMultipleMessage, nodes.length)
            };
        },

        enabled: function (status, options) {
            var node = CommandHelper.getJustOneNode(status),
			signature = 'delete_business_attachment',
			action = this._getNodeActionForSignature(node, signature);
			if (action) {
				return true;
			} else {
				return false;
			}
        },

        // Perform the detach action. Return a promise, which is resolved with the detached node if
        // successful or rejected with the error.
        // Note, that the node is used later to display the name of the detached item.
        _performAction: function (model, options) {
            var self = this;
            var node = model.node;
            var d = $.Deferred();
            var collection = node.collection;
            if (collection) {
                var jqxhr = node.destroy({
                    wait: true
                })
                    .done(function () {
                        model.set('count', 1);
                        model.deferred.resolve(model);
                        d.resolve(node);
                    })
                    .fail(function (error) {
                        var cmdError = error ? new CommandError(error, node) : error;
                        model.deferred.reject(model, cmdError);
                        if (!error) {
                            jqxhr.abort();
                        }
                        d.reject(cmdError);
                    });
                return d.promise();
            }
            else {
                return d.reject(
                    new CommandError(_.str.sformat(lang.CommandFailedSingular, node.get('name'),
                        lang.CommandVerbDetach), {errorDetails: "collection is undefined"}));
            }
        },

        startGlobalMessage: function (uploadCollection) {
            globalMessage.showFileUploadProgress(uploadCollection, {
                oneFileTitle: lang.DetachingOneBusAtt,
                oneFileSuccess: lang.DetachOneBusAttSuccessMessage,
                multiFileSuccess: lang.DetachManyBusAttsSuccessMessage,
                oneFilePending: lang.DetachingOneBusAtt,
                multiFilePending: lang.DetachBusAtts,
                oneFileFailure: lang.DetachOneBusAttFailMessage,
                multiFileFailure: lang.DetachManyBusAttsFailMessage2,
                someFileSuccess: lang.DetachSomeBusAttsSuccessMessage,
                someFilePending: lang.DetachingSomeBusAtts,
                someFileFailure: lang.DetachSomeBusAttsFailMessage2,
                enableCancel: false
            });

        },

        _removeBusAtt: function (model) {
            // this.collection.destroy(model);
            return (model.destroy({wait: true}));
        },

        _getRespError: function (resp) {
            var error = '';
            if (resp && resp.responseJSON && resp.responseJSON.error) {
                error = resp.responseJSON.error;
            } else if (base.messageHelper.hasMessages()) {
                error = $(base.messageHelper.toHtml()).text();
                base.messageHelper.clear();
            }
            return error;
        },

        _announceStart: function (status) { //, PageLeavingBlocker) {
            var originatingView = status.originatingView;
            if (originatingView && originatingView.blockActions) {
                originatingView.blockActions();
            }
            var pageLeavingWarning = this.get('pageLeavingWarning');
            if (pageLeavingWarning) {
                this.PageLeavingBlocker.enable(pageLeavingWarning);
            }
        },

        _announceFinish: function (status) {
            var pageLeavingWarning = this.get('pageLeavingWarning');
            if (pageLeavingWarning) {
                this.PageLeavingBlocker.disable();
            }
            var originatingView = status.originatingView;
            if (originatingView && originatingView.unblockActions) {
                originatingView.unblockActions();
            }
        }
    });

    _.extend(DetachAttachmentCommand.prototype, ConfirmableCommand, {
        execute: function (status, options) {
            var nodes    = CommandHelper.getAtLeastOneNode(status),
                node     = nodes.length === 1 && nodes.first(),
                deferred = $.Deferred(),
                commandData = status.data || {};
            var showProgressDialog = (commandData.showProgressDialog != null)? commandData.showProgressDialog: true;
            this.showProgressDialog = showProgressDialog;
            // avoid messages from handleExecutionResults
            status.suppressFailMessage = true;
            status.suppressSuccessMessage = true;
            status.suppressMultipleFailMessage = true;
            ConfirmableCommand.execute
                .apply(this, arguments)
                .done(function (results) {
                    showProgressDialog && globalMessage.hideFileUploadProgress();
                    deferred.resolve(results);
                })
                .fail(function (args) {
                    //only return a result if there is at least one successful delete.
                    //This way the waiting CommandHelper in the tabletoolbar.view will trigger
                    //an execute complete event.
                    var oneSuccess = args && _.find(args, function (result) {
                            return !(result instanceof CommandError);
                        });
                    var rejectResults = oneSuccess ? oneSuccess: args;
                    deferred.reject(rejectResults);
                });
            return deferred.promise();
        },

        _performActions: function (status, options) {
            var deferred = $.Deferred(),
                self = this;
            csui.require(['csui/utils/taskqueue', 'csui/utils/page.leaving.blocker', 'csui/models/fileuploads',
                    "csui/utils/commands/multiple.items",
                    'csui/controls/globalmessage/globalmessage',
                    'csui/utils/messagehelper',
                    'csui/utils/base'
                ], function (TaskQueue, PageLeavingBlocker, UploadFileCollection, MultipleItemsCommand, GlobalMessage, MessageHelper, base) {
                    messageHelper = MessageHelper;
                    globalMessage = GlobalMessage;
                    base = base;
                    self.PageLeavingBlocker = arguments[1];

                    var busAtts = CommandHelper.getAtLeastOneNode(status);
                    var models = busAtts.models;
                    // var models = status.nodes.models;
                    var nodes = _.map(models, function (node) {
                        return {
                            name: node.get('name'),
                            state: 'pending',
                            count: 0,
                            total: 1,
                            node: node
                        };
                    });
                    var connector = models && models[0] && models[0].connector;
                    var uploadCollection = new UploadFileCollection(nodes, {connector: connector});
                    var newStatus = _.defaults({nodes: uploadCollection}, status);
                    // TODO: Make the progressbar a reusable component; do not
                    // misuse the file-upload-progressbar for other scenarios.
                    // TODO: Handle this in the multi-item command to be consistent
                    // with other commands; do not override the detach command only.
                    uploadCollection.each(function (fileUpload) {
                        // Replace the new node in the file upload model with the existing
                        // one to be able to destroy it; sync and destroy events will be
                        // triggered on it and the parent collection and view will see them.
                        var node = fileUpload.get('node');
                        fileUpload.node = node;
                        fileUpload.unset('node');
                    });
                    self.startGlobalMessage(uploadCollection);
                    MultipleItemsCommand._performActions.call(self, newStatus, options)
                        .done(function (results) {
                            globalMessage.hideFileUploadProgress();
                            deferred.resolve(results);
                        })
                        .fail(function (errors) {
                            deferred.reject(errors);
                        });
                },
                function (error) {
                    console.log(error);
                    deferred.reject(error);
                });
            return deferred.promise();

        }
        
    });
    
    return DetachAttachmentCommand;

});


csui.define('xecmpf/utils/commands/myattachments/go_to_workspace',['module', 'csui/models/command',
    'csui/utils/commandhelper',
    'csui/lib/underscore',
    'csui/lib/jquery',
    'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, CommandModel, CommandHelper, _, $, lang) {
    'use strict';
    //
    // var config = _.defaults({}, module.config(), {
    //     openInNewTab: false
    // });

    var GoToWorkspaceCommand = CommandModel.extend({

        defaults: {
            signature: 'go_to_workspace',
            command_key: ['go_to_workspace'],
            name: lang.CommandNameGoToWorkspace, 
            scope: 'single'
        },

        enabled: function (status) {
            var node = CommandHelper.getJustOneNode(status),
			signature = this.get('command_key'),
			action = this._getNodeActionForSignature(node, signature);
			if (action) {
				return true;
			} else {
				return false;
			}
        },

        execute: function (status, options) {
            var busAtt = CommandHelper.getJustOneNode(status);
            return this._navigateTo(busAtt, status, options);
        },

        // openInNewTab: function () {
        //     return config.openInNewTab;
        // },

        _navigateTo: function (busAtt, status, options) {
            var deferred = $.Deferred(),
                context = status.context || status.originatingView.options.context,
                wkspNodeId = busAtt.get('wksp_id'); // Get BWs ID from the business attachment
            // Require additional modules dynamically, which needed
            // for the command execution only
            csui.require(['csui/lib/backbone', 'csui/utils/contexts/factories/connector',
                'csui/models/node/node.model', 'csui/utils/commands/browse'
            ], function (Backbone, ConnectorFactory, NodeModel, BrowseCommand) {
                var connector = context.getObject(ConnectorFactory),
                    otherNode = new NodeModel({id: wkspNodeId}, {connector: connector}),
                    browseCommand = new BrowseCommand();
                browseCommand
                    .execute({
                        nodes: new Backbone.Collection([otherNode]),
                        context: context
                    });
            }, function(error) {
                console.log(error);
                deferred.reject();
            });
            return deferred.promise();
        }

    });

    return GoToWorkspaceCommand;

});

csui.define('xecmpf/utils/commands/myattachments/open_sap_object',['module', 'csui/models/command',
    'csui/utils/commandhelper',
    'csui/lib/underscore',
    'csui/lib/jquery',
    'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (module, CommandModel, CommandHelper, _, $, lang) {
    'use strict';

    var config = _.defaults({}, module.config(), {
        openInNewTab: true
    });

    var OpenSapObjectCommand = CommandModel.extend({

        defaults: {
            signature: 'open_sap_object',
            command_key: ['open_sap_object'],
            name: lang.CommandNameOpenSapObject,
            scope: 'single'
        },

        enabled: function (status) {
            var node = CommandHelper.getJustOneNode(status),
			signature = this.get('command_key'),
			action = this._getNodeActionForSignature(node, signature);
			if (action) {
				var currAction = node.actions && node.actions.findRecursively(signature);
				if (currAction.get('href')) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
        },

        execute: function (status, options) {
            var busAtt = CommandHelper.getJustOneNode(status);
            return this._navigateTo(busAtt, options);
        },

        openInNewTab: function () {
            return config.openInNewTab;
        },

        _navigateTo: function (busAtt, options) {
            var action = busAtt.actions.findRecursively(this.attributes.signature);
            var url = action.get('href');

            if (this.openInNewTab() === true) {
                var browserTab = window.open(url, '_blank');
                browserTab.focus();
            } else {
                location.href = url;
            }

            return $.Deferred().resolve().promise();
        }

    });

    return OpenSapObjectCommand;

});

csui.define('xecmpf/utils/commands/myattachments/add_myattachment',['require', 'csui/models/command',
    'csui/utils/commandhelper',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/utils/commands/confirmable',
    'i18n!xecmpf/utils/commands/nls/localized.strings'
], function (require, CommandModel, CommandHelper, $, _, ConfirmableCommand, lang) {
    'use strict';

    var AttachmentModel;
    var messageHelper;
    var globalMessage;
    var commandError;
    var base;
    var globals = {};

    var AddAttachmentCommand = CommandModel.extend({

        defaults: {
            signature: 'add_business_attachment',
            command_key: ['add_business_attachment'],
            name: lang.CommandNameAttach,
            scope: 'multiple',
            doneVerb: lang.CommandDoneVerbAttached,
            successMessages: {
                formatForNone: lang.AttachBusAttsNoneMessage,
                formatForOne:  lang.AttachOneBusAttSuccessMessage,
                formatForTwo:  lang.AttachSomeBusAttsSuccessMessage,
                formatForFive: lang.AttachManyBusAttsSuccessMessage
            },
            errorMessages: {
                formatForNone: lang.AttachBusAttsNoneMessage,
                formatForOne:  lang.AttachOneBusAttFailMessage,
                formatForTwo:  lang.AttachSomeBusAttsFailMessage,
                formatForFive: lang. AttachManyBusAttsFailMessage
            }
        },

        _getConfirmTemplate: function (status, options) {
            return _.template(lang.AttachBusAttsCommandConfirmDialogHtml);
        },

        _getConfirmData: function (status, options) {
            var nodes = CommandHelper.getAtLeastOneNode(status);
            return {
                title: lang.AttachBusAttsCommandConfirmDialogTitle,
                message: nodes.length === 1 ?
                         _.str.sformat(lang.AttachBusAttsCommandConfirmDialogSingleMessage,
                             nodes.at(0).get('name')) :
                         _.str.sformat(lang.AttachBusAttsCommandConfirmDialogMultipleMessage, nodes.length)
            };
        },

        enabled: function (status) {
            if (status.container.busatts.actions) {
                var add = _.has(status.container.busatts.actions.data, this.defaults.signature);
                if (add) {
                    return true;
                }
                else {

                    return false;
                }
            }
            return false;
        },
    });

    _.extend( AddAttachmentCommand.prototype, ConfirmableCommand, {
        execute: function (status, options) {

            return (this._referenceSearchOpen(status, options));

        },

        _referenceSearchOpen: function (status, options) {
            var deferred = $.Deferred();
            var self = this;
            csui.require([
                    'csui/utils/contexts/factories/connector',
                    'i18n!xecmpf/widgets/myattachments/nls/myattachments.lang',
                    'xecmpf/widgets/myattachments/metadata.attachment.model',
                    'xecmpf/controls/bosearch/bosearch.model',
                    'xecmpf/controls/bosearch/bosearch.dialog.controller',
                    'csui/utils/command.error',
                ], function (ConnectorFactory, lang, AttachmentModelLocal,
                             BoSearchModel, BOSearchDialogController, CommandError) {
                    AttachmentModel = AttachmentModelLocal;
                    commandError = CommandError;
                    self.connector = options.context.getObject(ConnectorFactory);
                    self.collection = status.data.collection;

                    self.boSearchModel = new BoSearchModel(status.data.boType, {
                        connector: self.connector
                    });

                    // Check whether the bus. att. control is executed w/o sidebar
                    var htmlPlace;
                    htmlPlace = ".cs-properties-wrapper>.cs-metadata";

                    self.boSearchDialogController = new BOSearchDialogController({
                        context: options.context,
                        htmlPlace: htmlPlace,
                        multipleSelect: true,
                        mode: 'business_attachment_add',
                        boSearchModel: self.boSearchModel,
                        title: lang.BOSearchTitle
                    });
                    self.status = status;
                    // SAPRM-9320: together with this topic the events are aligned
                    //self.listenTo(self.boSearchModel, "reference:selected", self._referenceSearchAttach);
                    self.listenTo(self.boSearchModel, "boresult:select", self._referenceSearchAttach);
                    // End of SAPRM-9320
                    self.boSearchModel.trigger("reference:search");
                    deferred.resolve();
                },
                function (error) {
                    console.log(error);
                    deferred.reject(error);
                });
            return deferred.promise();
        },

        _referenceSearchAttach: function (selected) {
            var deferred = $.Deferred(),
                self = this;
            csui.require(['csui/utils/page.leaving.blocker',
                    'csui/models/fileuploads',
                    "csui/utils/commands/multiple.items",
                    'csui/controls/globalmessage/globalmessage',
                    'csui/utils/messagehelper',
                    'csui/utils/command.error',
                    'csui/utils/base'
                ], function (PageLeavingBlocker, UploadFileCollection, MultipleItemsCommand, GlobalMessage, MessageHelper, CommandError, base) {
                    messageHelper = MessageHelper;
                    globalMessage = GlobalMessage;
                    commandError = CommandError;
                    base = base;
                    var options;
                    self.PageLeavingBlocker = arguments[1];
                    // SAPRM-9320:
                    // close the bo search dialog
                    self.boSearchModel.trigger("reference:selected");
                    if (selected.selectedItems) {
                        var models = selected.selectedItems;
                        var nodes = _.map(models, function (node) {
                            return {
                                name: node.get('businessObjectId'),
                                state: 'pending',
                                count: 0,
                                total: 1,
                                node: node
                            };
                        });
                        var connector = models && models[0] && models[0].connector;
                        var uploadCollection = new UploadFileCollection(nodes, {connector: connector});
                        var newStatus = _.defaults({nodes: uploadCollection}, status);
                        // prevent multiple messages:
                        newStatus.suppressMultipleFailMessage = true;
                        // TODO: Make the progressbar a reusable component; do not
                        // misuse the file-upload-progressbar for other scenarios.
                        // TODO: Handle this in the multi-item command to be consistent
                        // with other commands; do not override the attach command only.
                        uploadCollection.each(function (fileUpload) {
                            // Replace the new node in the file upload model with the existing
                            // one to be able to destroy it; sync and destroy events will be
                            // triggered on it and the parent collection and view will see them.
                            var node = fileUpload.get('node');
                            fileUpload.node = node;
                            fileUpload.unset('node');
                        });
                        self.startGlobalMessage(uploadCollection);
                        MultipleItemsCommand._performActions.call(self, newStatus, options)
                            .done(function (results) {
                                globalMessage.hideFileUploadProgress();
                                deferred.resolve(results);
                            })
                            .fail(function (errors) {
                                deferred.reject(errors);
                            });
                    }
                },
                function (error) {
                    console.log(error);
                    deferred.reject(error);
                });
            return deferred.promise();

        },

        startGlobalMessage: function (uploadCollection) {
            globalMessage.showFileUploadProgress(uploadCollection, {
                oneFileTitle: lang.AttachingOneBusAtt,
                oneFileSuccess: lang.AttachOneBusAttSuccessMessage,
                multiFileSuccess: lang.AttachManyBusAttsSuccessMessage,
                oneFilePending: lang.AttachingOneBusAtt,
                multiFilePending: lang.AttachBusAtts,
                oneFileFailure: lang.AttachOneBusAttFailMessage,
                multiFileFailure: lang.AttachManyBusAttsFailMessage2,
                someFileSuccess: lang.AttachSomeBusAttsSuccessMessage,
                someFilePending: lang.AttachingSomeBusAtts,
                someFileFailure: lang.AttachSomeBusAttsFailMessage2,
                enableCancel: false
            });

        },

        // Perform the attach action. Return a promise, which is resolved with the attached node if
        // successful or rejected with the error.
        // Note, that the node is used later to display the name of the attached item.
        _performAction: function (model, options) {
            var node = model.node;
            var d = $.Deferred();
            var self = this;
            if (this.collection) {
                var ext_system_id = this.boSearchModel.get('ext_system_id'),
                    bo_type = this.boSearchModel.get('bo_type'),
                    comment = '';

                var bo_id = node.get('businessObjectId');
                var id = ext_system_id + bo_type + bo_id;
                var obody = {
                    "ext_system_id": ext_system_id,
                    "bo_type": bo_type,
                    "bo_id": bo_id,
                    "comment": comment
                };
                var busAttModel = new AttachmentModel(obody, { collection: this.collection, connector: this.connector});
                busAttModel.isLocallyCreated = true;

                busAttModel.save({wait: true, silent: true})
                    .done(function (args) {
                        self.collection.add(busAttModel, {at: 0});
                        model.set('count', 1);
                        model.deferred.resolve(model);
                        d.resolve(node);
                    })
                    .fail(function (error) {
                        var cmdError = error ? new commandError(error, node) : error;
                        model.deferred.reject(model, cmdError);
                        d.reject(cmdError);
                    });
                return d.promise();
            }
            else {
                return d.reject(
                    new commandError(_.str.sformat(lang.CommandFailedSingular, node.get('name'),
                        lang.CommandVerbAttach), {errorDetails: "collection is undefined"}));
            }
        },


        _announceStart: function (status) {
            var originatingView = status.originatingView;
            if (originatingView && originatingView.blockActions) {
                originatingView.blockActions();
            }
            var pageLeavingWarning = this.get('pageLeavingWarning');
            if (pageLeavingWarning) {
                this.PageLeavingBlocker.enable(pageLeavingWarning);
            }
        },

        _announceFinish: function (status) {
            if (this.get('pageLeavingWarning')) {
                this.PageLeavingBlocker.disable();
            }
            var originatingView = status.originatingView;
            if (originatingView && originatingView.unblockActions) {
                originatingView.unblockActions();
            }
        }

    });


    return AddAttachmentCommand;

})
;

csui.define('xecmpf/utils/commands/myattachments',['csui/lib/underscore', 'csui/models/commands',
    'xecmpf/utils/commands/myattachments/detach_myattachment',
    'xecmpf/utils/commands/myattachments/go_to_workspace',
    'xecmpf/utils/commands/myattachments/open_sap_object',
    'xecmpf/utils/commands/myattachments/add_myattachment'
], function (_, CommandCollection,
             DetachAttachmentCommand,
             GoToWorkspaceCommand,
             OpenSapCommand,
             AddAttachmentCommand
) {
    'use strict';

    var commands = new CommandCollection([
        new DetachAttachmentCommand(),
        new GoToWorkspaceCommand(),
        new OpenSapCommand(),
        new AddAttachmentCommand()
    ]);

    return commands;

});
csui.define('xecmpf/widgets/myattachments/metadata.attachments.columns',["csui/lib/backbone"],
    function (Backbone) {

        var TableColumnModel = Backbone.Model.extend({

            idAttribute: "key",

            defaults: {
                key: null,  // key from the resource metadata
                sequence: 0 // smaller number moves the column to the front
            }

        });

        var TableColumnCollection = Backbone.Collection.extend({

            model: TableColumnModel,
            comparator: "sequence",

            getColumnKeys: function () {
                return this.pluck('key');
            },

            deepClone: function () {
                return new TableColumnCollection(
                    this.map(function (column) {
                        return column.attributes;
                    }));
            }
        });

        // Fixed (system) columns have sequence number < 100, dynamic columns
        // have sequence number > 1000

        var tableColumns = new TableColumnCollection([

            {
                key: 'bo_id',
                sequence: 10
            },
            {
                key: 'name',
                sequence: 20
            },
            {
                key: 'ext_system_name',
                sequence: 30
            },
            {
                key: 'create_date',
                sequence: 40
            },
            {
                key: 'created_by_name',
                sequence: 50
            },
            {
                key: 'comment',
                sequence: 60
            }
        ]);

        return tableColumns;

    });


csui.define('css!xecmpf/widgets/myattachments/metadata.attachments',[],function(){});
csui.define('xecmpf/widgets/myattachments/metadata.attachments.toolbaritems',['csui/lib/underscore',
    'i18n!xecmpf/widgets/myattachments/nls/myattachments.lang',
    'csui/controls/toolbar/toolitems.factory',
    'css!xecmpf/widgets/myattachments/metadata.attachments'
], function (_, lang, ToolItemsFactory) {

    var toolbarItems = {
        addToolbar: new ToolItemsFactory({
                add: [
                    //{signature: "AddFolder", name: lang.ToolbarItemAddFolder},
                    //{signature: "AddDocument", name: lang.ToolbarItemAddDocument}
                ]
            },
            {
                maxItemsShown: 0, // force toolbar to immediately start with a drop-down list
                dropDownIcon: "icon icon-toolbarAdd",
                dropDownText: lang.AddBusinessAttachment,
                addTrailingDivider: false

            }),

        otherToolbar: new ToolItemsFactory(
            {
                main: [
                    {
                        signature: "detach_business_attachment",
                        name: lang.DetachBusinessAttachment,
                        //  icon: "icon icon-toolbar-metadata",
                        scope: "multiple",
                        verb: "detach_business_attachment"
                    },
                    {
                        signature: "open_sap_object",
                        name: lang.OpenSapObject
                    },
                    {
                        signature: "go_to_workspace",
                        name: lang.GoToWorkspace
                    }
                ]
            },
            {
                maxItemsShown: 5,
                dropDownIcon: "icon icon-toolbar-more"
            }),
        // inline action bar
        inlineActionbar: new ToolItemsFactory({
                other: [
                    {
                        signature: "detach_business_attachment",
                        name: lang.DetachBusinessAttachment,
                        verb: "detach_business_attachment",
                        icon: "icon icon-toolbar-detach"
                    },
                    {
                        signature: "open_sap_object",
                        name: lang.OpenSapObject,
                        icon: "icon icon-toolbar-preview"
                    },
                    {
                        signature: "go_to_workspace",
                        name: lang.GoToWorkspace,
                        icon: "icon icon-toolbar-workspace"
                    }
                ]
            },
            {
                maxItemsShown: 5,
                dropDownText: lang.ToolbarItemMore,
                dropDownIcon: "icon icon-toolbar-more"
            })
    };

    return toolbarItems;

});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/myattachments/metadata.attachments',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"csui-metadata-myattachments\">\r\n  <div id=\"att-tabletoolbar\"></div>\r\n  <div id=\"att-tableview\"></div>\r\n  <div id=\"att-paginationview\"></div>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_widgets_myattachments_metadata.attachments', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/myattachments/metadata.attachments.view',["module", "csui/lib/jquery", "csui/lib/underscore", 'csui/lib/marionette',
    'csui/controls/tabletoolbar/tabletoolbar.view',
    'csui/controls/tableactionbar/tableactionbar.view',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/controls/table/table.view', 'csui/controls/pagination/nodespagination.view',
    'xecmpf/utils/commands/myattachments', 'csui/models/columns',
    'xecmpf/widgets/myattachments/metadata.nodeattachments.model', 'xecmpf/widgets/myattachments/metadata.attachment.model',
    'xecmpf/widgets/myattachments/metadata.attachments.columns',
    'xecmpf/widgets/myattachments/metadata.attachments.toolbaritems',
    'hbs!xecmpf/widgets/myattachments/metadata.attachments',
    'csui/controls/toolbar/toolitem.model',
    'csui/controls/globalmessage/globalmessage',
    'csui/controls/toolbar/toolbar.command.controller',
    'csui/utils/url',
    'csui/utils/base',
    'i18n!xecmpf/widgets/myattachments/nls/myattachments.lang',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'css!xecmpf/widgets/myattachments/metadata.attachments'

], function (module, $, _, Marionette,
             TableToolbarView,
             TableActionBarView,
             LayoutViewEventsPropagationMixin,
             TableView,
             PaginationView,
             commands,
             NodeColumnCollection,
             NodeAttachmentsCollection,
             AttachmentModel,
             metadataAttachmentsColumns,
             toolbarItems,
             template,
             ToolItemModel,
             GlobalMessage,
             ToolbarCommandController,
             Url,
             base,
             lang,
             PerfectScrollingBehavior) {
    'use strict';

    var config = module.config();
    _.defaults(config, {
        defaultPageSize: 30,
        showInlineActionBarOnHover: !base.isTouchBrowser(),
        forceInlineActionBarOnClick: false,
        inlineActionBarStyle: "csui-table-actionbar-bubble",
        clearFilterOnChange: true,
        resetOrderOnChange: false,
        resetLimitOnChange: true,
        fixedFilterOnChange: false
    });


    var MetadataAttachmentsTableView = Marionette.LayoutView.extend({

        className: 'metadata-inner-wrapper',
        template: template,

        ui: {
            tableView: '#att-tableview',
            childContainer: '#att-tableview',
            paginationView: '#att-paginationview'
        },

        regions: {
            tableToolbarRegion: '#att-tabletoolbar',
            tableRegion: '#att-tableview',
            paginationRegion: '#att-paginationview'
        },

        constructor: function MetadataAttachmentsTableView(options) {
            MetadataAttachmentsTableView.__super__.constructor.call(this, options);

            this.options.data || (this.options.data = {});
            _.defaults(this.options.data, {
                pageSize: config.defaultPageSize || 30,
            });

            this.commands = commands;
            this.collection = new NodeAttachmentsCollection(undefined, {
                node: this.options.model,
                autoreset: true,
                expand: "user",
                commands: this.commands,
                onlyClientSideDefinedColumns: true  // ignore columns sent by server
            });

            // SAPRM-8811: for pagination we need an additonal collection.fetch after
            //             detaching all items of a page
            this.commandController = new ToolbarCommandController({commands: this.commands});
            this.listenTo(this.commandController, 'after:execute:command', this._toolbarActionTriggered);

            this.behaviors = _.extend({
                PerfectScrolling: {
                    behaviorClass: PerfectScrollingBehavior,
                    contentParent: '> .tab-content',
                    scrollXMarginOffset: 30,
                    // like bottom padding of container, otherwise scrollbar is shown always
                    scrollYMarginOffset: 15
                }
            }, this.behaviors);

            this.options.model.busatts = this.collection;  // connect bus.attachment collection with node

            this._setToolBar();
            this._setTableView();
            this._setPagination();

            this.setActionBarEvents();

            this.collection.fetch();

            // Cause the show events triggered on the parent view re-triggered
            // on the views placed in the inner regions
            this.propagateEventsToRegions();
        },

        onRender: function () {
            this.tableToolbarRegion.show(this.tableToolbarView);
            this.tableRegion.show(this.tableView);
            this.paginationRegion.show(this.paginationView);
        },

        // controller for the toolbar actions
        _toolbarActionTriggered: function (toolbarActionContext) {
            if (toolbarActionContext) {
                switch (toolbarActionContext.commandSignature) {
                case 'detach_business_attachment':
                    this.collection.fetch();
                    break;
                }
            }
        },

        _buildToolbarItems: function () {
            var deferred = $.Deferred();
            var getBoTypesUrl = Url.combine(this.model.urlBase(), 'addablebotypes');
            getBoTypesUrl = getBoTypesUrl.replace('/v1', '/v2');
            var ajaxOptions = this.model.connector.extendAjaxOptions({
                type: 'GET',
                url: getBoTypesUrl
            });

            var that = this;
            $.ajax(ajaxOptions)
                .done(function (response, statusText, jqxhr) {
                    var toolItems = [];
                    if (response && response.results && response.results.length > 0) {                        
                        response.results.forEach(function (boTypeRes) {
                            var toolItem = new ToolItemModel({
                                signature: 'add_business_attachment',
                                name: boTypeRes.data.properties.bo_type_name,
                                type: 123, //addType,
                                group: 'add',
                                commandData: {
                                    boType: boTypeRes.data.properties,
                                    node_id: that.model.get('id'),
                                    collection: that.collection
                                }
                            });
                            toolItems.push(toolItem);
                        });

                        // sort toolbarItems
                        if (toolItems.length > 0) {
                            toolItems.sort(function (a, b) {
                                var aname = a.get("name"),
                                    bname = b.get("name"),
                                    result = base.localeCompareString(aname, bname, {usage: "sort"});
                                return result;
                            });
                        }                        
                    }
                    toolbarItems.addToolbar.reset(toolItems);
                    deferred.resolve.apply(deferred, arguments);
                })
                .fail(function (jqXHR, statusText, error) {

                    // show failure message
                    var linesep = "\r\n",
                        lines = [];
                    if (statusText !== "error") {
                        lines.push(statusText);
                    }
                    if (jqXHR.responseText) {
                        var respObj = JSON.parse(jqXHR.responseText);
                        if (respObj && respObj.error) {
                            lines.push(respObj.error);
                        }
                    }
                    if (error) {
                        lines.push(error);
                    }
                    var errmsg = lines.length > 0 ? lines.join(linesep) : undefined;
                    GlobalMessage.showMessage("error", lang.ErrorLoadingAddItemMenu, errmsg);
                    deferred.reject.apply(deferred, arguments);
                });
        },

        _setToolBar: function () {
            var originatingView = this;
            // for metadata of bus. attachments, try to pass the parent originating view if found
            if (this.options && this.options.metadataView && this.options.metadataView.options &&
                this.options.metadataView.options.metadataNavigationView) {
                originatingView = this.options.metadataView.options.metadataNavigationView;
            }

            // Get business object types
            this._buildToolbarItems();

            this.tableToolbarView = new TableToolbarView({
                context: this.options.context,
                commands: commands,
                toolbarItems: toolbarItems,
                collection: this.collection,
                originatingView: originatingView,
                toolbarCommandController: this.commandController
                // addableTypes: this.addableTypes
            });
        },

        _updateToolItems: function () {
            if (this.tableToolbarView) {
                this.tableToolbarView.updateForSelectedChildren(this.tableView.getSelectedChildren());
            }
        },

        _setTableView: function () {
            this.options || (this.options = {});

            var args = _.extend({
                tableColumns: metadataAttachmentsColumns,
                context: this.options.context,
                connector: this.model.connector,
                collection: this.collection,
                columns: this.collection.columns,
                pageSize: this.options.data.pageSize,
                columnsWithSearch: ['name', 'bo_id'],
                orderBy: "bo_id asc",
                commands: commands,
                customLabels: {
                    zeroRecordsMsg: lang.noBusinessAttachmentsAvailable
                }
            }, this.options);

            this.tableView = new TableView(args);

            // Events

            this.listenTo(this.tableView, "tableRowSelected", this._updateToolItems);
            this.listenTo(this.tableView, "tableRowUnselected", this._updateToolItems);
            this.listenTo(this.collection, "reset", this._updateToolItems);
            this.listenTo(this.collection, "change", this._updateToolItems);
            this.listenTo(this.collection, "remove", this._updateToolItems);

            // rebuild toolbar items because of possible metadata option (SAPRM-8812)
            this.listenTo(this.collection, "add", this._buildToolbarItems);
            this.listenTo(this.collection, "remove", this._buildToolbarItems);
        },

        _setPagination: function () {
            this.paginationView = new PaginationView({
                collection: this.collection,
                pageSize: this.options.data.pageSize
            });

            //this.listenTo(this.paginationView, 'render:complete', _.bind(this._setTableViewHeight, this));
            return true;
        },

        setActionBarEvents: function () {
            if (config.forceInlineActionBarOnClick) {
                this.listenTo(this.tableView, 'row:clicked', function (args) {
                    if (this.tableActionBarView) {
                        var oldModelId = this.tableActionBarView.model.get('id');
                        var newModelId = args.node.get('id');
                        if (oldModelId === newModelId) {
                            return;
                        }
                    }
                    this._destroyOldAndCreateNewActionBarWithoutDelay(args);
                });
            } else {
                if (config.showInlineActionBarOnHover) {
                    this.listenTo(this.tableView, 'enterTableRow', this._showActionBarWithDelay);
                    this.listenTo(this.tableView, 'leaveTableRow', this._actionBarShouldDestroy);
                }
            }
            this.listenTo(this.collection, "reset", this._destroyActionBar);
            if (this.collection.node) {
                this.listenTo(this.collection.node, 'change:id', this._destroyActionBar);
            }
        },

        _showActionBar: function (args) {
            var selectedItems = this.tableView.getSelectedChildren();
            if (selectedItems.length > 0) {
                // no action bar if items are selected
                return;
            }
            if (this.tableActionBarView) {
                this._savedHoverEnterArgs = args;
                // ignore until action bar removed itself
            } else {
                this._savedHoverEnterArgs = null;

                this.tableActionBarView = new TableActionBarView(_.extend({
                        context: this.options.context,
                        commands: /*this.defaultActionController.*/commands,
                        collection: toolbarItems.inlineActionbar,
                        delayedActions: this.collection.delayedActions,
                        container: this.collection.node,
                        model: args.node,
                        originatingView: this
                    }, toolbarItems.inlineActionbar.options, {
                        inlineActionBarStyle: config.inlineActionBarStyle
                    })
                );
                this.tableActionBarView.render();
                this.listenToOnce(this.tableActionBarView, 'destroy', function () {
                    //Even though we are listening to tableActionBar 'destroy' even once, that event listener is not
                    //being removed after the fact. To ensure memory cleanup, the event listener if forcibly removed.
                    if (this.tableActionBarView) {
                        this.stopListening(this.tableActionBarView);
                    }
                    if (this._savedHoverEnterArgs) {
                        this._showActionBarWithDelay(this._savedHoverEnterArgs);
                    }
                }, this);
                var abEl = this.tableActionBarView.$el;

                var nameCell = this.tableView.getNameCell(args.target);
                if (nameCell && nameCell.length === 1) {
                    var actionBarDiv = nameCell.find('.csui-table-cell-name-appendix');
                    actionBarDiv.append(abEl);
                    actionBarDiv.addClass('csui-table-cell-name-appendix-full');
                    this.tableActionBarView.triggerMethod("after:show");
                }
            }
        },

        _showActionBarWithDelay: function (args) {
            if (this._showActionbarTimeout) {
                clearTimeout(this._showActionbarTimeout);
            }
            var self = this;
            this._showActionbarTimeout = setTimeout(function () {
                self._showActionbarTimeout = null;
                if (!self.tableView.lockedForOtherContols) {
                    // don't show the action bar control if the table view is locked because a different
                    // control is already open
                    self._showActionBar.call(self, args);
                }
            }, 200);
        },

        _destroyOldAndCreateNewActionBarWithoutDelay: function (args) {
            this._actionBarShouldDestroy();
            if (!this.tableView.lockedForOtherContols) {
                // don't show the action bar control if the table view is locked because a different
                // control is already open
                this._showActionBar.call(this, args);
            }
        },

        _actionBarShouldDestroy: function () {
            if (this._showActionbarTimeout) {
                clearTimeout(this._showActionbarTimeout);
                this._showActionbarTimeout = null;
            }
            this._destroyActionBar();
        },

        _destroyActionBar: function () {
            if (this.tableActionBarView) {
                var actionBarDiv = this.tableActionBarView.$el.parent();
                actionBarDiv.removeClass('csui-table-cell-name-appendix-full');

                this.tableActionBarView.destroy();
                this.tableActionBarView = null;
            }
        },

    });

    // Add the mixin functionality to the target view
    _.extend(MetadataAttachmentsTableView.prototype, LayoutViewEventsPropagationMixin);

    return MetadataAttachmentsTableView;

});

csui.define('xecmpf/widgets/myattachments/metadata.property.panels',['i18n!xecmpf/widgets/myattachments/nls/myattachments.lang',
  "xecmpf/widgets/myattachments/metadata.attachments.view"
], function (lang, MyAttachmentsView) {

  return [

    {
      title: lang.attachmentsTabTitle,
      sequence: 40,
      contentView:  MyAttachmentsView
    }

  ];

});

csui.define('xecmpf/widgets/dossier/impl/dossier.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/connector',
  'csui/utils/contexts/factories/node',
  'xecmpf/widgets/dossier/impl/dossier.model'
], function (module, _, Backbone,
    CollectionFactory, ConnectorFactory, NodeModelFactory,
    DossierCollection) {

  var DossierCollectionFactory;

  DossierCollectionFactory = CollectionFactory.extend({

    propertyPrefix: 'dossierCollection',

    constructor: function DossierFactory(context, options) {
      CollectionFactory.prototype.constructor.apply(this, arguments);
      var dossierCollection = this.options.dossierCollection || {};
      if (!(dossierCollection instanceof Backbone.Collection)) {
        var connector = context.getObject(ConnectorFactory, options),
            config    = module.config();
        dossierCollection = new DossierCollection(dossierCollection.models, _.extend({
          connector: connector
        }, dossierCollection.options, config.options, {
          autofetch: true
        }, options));
      }
      this.property = dossierCollection;
    },

    fetch: function (options) {
      return this.property.fetch(options);
    }
  });

  return DossierCollectionFactory;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/behaviors/scroll.controls/impl/scroll.controls',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "glyphicon glyphicon-chevron-left";
},"3":function(depth0,helpers,partials,data) {
    return "glyphicon glyphicon-chevron-right";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"cs-scroll-control cs-scroll-control-left\">\r\n  <span class=\""
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.leftControlIconClass : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "\r\n  cs-scroll-control-icon cs-scroll-control-icon-left "
    + this.escapeExpression(((helper = (helper = helpers.leftControlIconClass || (depth0 != null ? depth0.leftControlIconClass : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"leftControlIconClass","hash":{}}) : helper)))
    + "\"></span>\r\n</div>\r\n<div class=\"cs-scroll-control cs-scroll-control-right\">\r\n  <span class=\""
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.rightControlIconClass : depth0),{"name":"unless","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "\r\n  cs-scroll-control-icon cs-scroll-control-icon-right "
    + this.escapeExpression(((helper = (helper = helpers.rightControlIconClass || (depth0 != null ? depth0.rightControlIconClass : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"rightControlIconClass","hash":{}}) : helper)))
    + "\"></span>\r\n</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_behaviors_scroll.controls_impl_scroll.controls', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/behaviors/scroll.controls/impl/scroll.controls',[],function(){});
csui.define('xecmpf/behaviors/scroll.controls/scroll.controls.behavior',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'hbs!xecmpf/behaviors/scroll.controls/impl/scroll.controls',
  'css!xecmpf/behaviors/scroll.controls/impl/scroll.controls'
], function (_, $, Marionette, template, css) {
  "use strict";

  var ScrollControlsBehavior;

  ScrollControlsBehavior = Marionette.Behavior.extend({

    defaults: {
      contentParent: null,
      controlsContainer: null,
      scrollableWidth: null, //px
      animateDuration: 400 //ms
    },

    ui: {
      leftControl: '.cs-scroll-control-left',
      rightControl: '.cs-scroll-control-right'
    },

    triggers: {
      'mousedown @ui.leftControl': 'scroll:left',
      'mousedown @ui.rightControl': 'scroll:right'
    },

    constructor: function ScrollControlsBehavior(options, view) {
      Marionette.Behavior.prototype.constructor.apply(this, arguments);
      this.listenTo(view, 'render', this._renderControls)
          .listenTo(view, 'dom:refresh', this._updateScrollControls)
          .listenTo(view, 'update:scroll:controls', this._updateScrollControls)
          .listenTo(view, 'scroll:left', this._scrollLeft)
          .listenTo(view, 'scroll:right', this._scrollRight)
          .listenTo(view, 'before:destroy', this._unbindUpdateControlsEvents);
    },

    _renderControls: function () {
      var controlsContainerSelector = getOption.call(this, 'controlsContainer');
      this._controlsContainer = controlsContainerSelector ?
                                this.view.$(controlsContainerSelector) : this.view.$el;

      var contentParentSelector = getOption.call(this, 'contentParent');
      this._contentParent = contentParentSelector ?
                            this.view.$(contentParentSelector) : this.view.$el;
      this._bindControlsUpdatingEvents();

      this.animateDuration = getOption.call(this, 'animateDuration');

      var data = {
        leftControlIconClass: getOption.call(this, 'leftControlIconClass'),
        rightControlIconClass: getOption.call(this, 'rightControlIconClass')
      };

      this._controlsContainer.append(template(data));
      this.view._bindUIElements.call(this);
    },

    _updateScrollControls: function () {
      if (this._contentParent && this._contentParent instanceof $) {
        var currentPos         = this._contentParent.scrollLeft(),
            scrollWidth        = this._contentParent.get(0).scrollWidth,
            contentParentWidth = this._contentParent.width();

        // for left control
        currentPos === 0 ? this.ui.leftControl.hide(100) : this.ui.leftControl.show(100);

        // for right control
        currentPos === (scrollWidth - contentParentWidth) ?
        this.ui.rightControl.hide(100) : this.ui.rightControl.show(100);
      }
    },

    _scrollLeft: function () {
      if (this._contentParent && this._contentParent instanceof $) {
        var scrollableWidth = getOption.call(this, 'scrollableWidth') ||
                              this._contentParent.innerWidth();
        var currentPos = this._contentParent.scrollLeft();
        this._contentParent
            .focus()
            .filter(':not(:animated)')
            .animate({scrollLeft: currentPos - scrollableWidth}, this.animateDuration, 'swing',
                $.proxy(function () {this.view.triggerMethod('update:scroll:controls')}, this));
      }
    },

    _scrollRight: function () {
      if (this._contentParent && this._contentParent instanceof $) {
        var scrollableWidth = getOption.call(this, 'scrollableWidth') ||
                              this._contentParent.innerWidth();
        var currentPos = this._contentParent.scrollLeft();
        this._contentParent
            .focus()
            .filter(':not(:animated)')
            .animate({scrollLeft: currentPos + scrollableWidth}, this.animateDuration, 'swing',
                $.proxy(function () {this.view.triggerMethod('update:scroll:controls')}, this));
      }
    },

    _bindControlsUpdatingEvents: function () {
      if (this._contentParent && this._contentParent instanceof $) {
        //Add 'tabindex=1' to div element to enable the capturing of the key events
        this._contentParent.attr('tabindex', 1);
        this._contentParent.on('keydown', $.proxy(function (e) {
          switch (e.which) {
          case 37:  // left arrow key
            this.view.triggerMethod('scroll:left');
            break;
          case 39:  // right arrow key
            this.view.triggerMethod('scroll:right');
            break;
          }
        }, this));

        $(window).on('resize', $.proxy(function () {this._updateScrollControls();}, this));
      }
    },

    _unbindUpdateControlsEvents: function () {
      if (this._contentParent && this._contentParent instanceof $) {
        this._contentParent.off('keydown');
        $(window).off('resize');
      }
    }
  });

  function getOption(property, source) {
    var options = source || this.options || {};
    var value = options[property];
    return _.isFunction(value) ? options[property].call(this.view) : value;
  }

  return ScrollControlsBehavior;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/utils/document.thumbnail/impl/document.thumbnail',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "  <div class=\"document-thumbnail-caption\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.disableIcon : depth0),{"name":"unless","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "    <span class=\"document-name\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{}}) : helper)))
    + "\">"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{}}) : helper)))
    + "</span>\r\n  </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "      <span class=\"csui-type-icon "
    + this.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"icon","hash":{}}) : helper)))
    + "\" aria-hidden=\"true\"></span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"document-thumbnail-wrapper\">\r\n  <div><a href=\"#\" class=\"thumbnail_not_loaded thumbnail_empty\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.document_name || (depth0 != null ? depth0.document_name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"document_name","hash":{}}) : helper)))
    + "\"></a></div>\r\n  <button class=\"wrapper\"><img src=\"\" class=\"img-doc-preview binf-hidden\" alt=\""
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{}}) : helper)))
    + "\" /></button>\r\n</div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.enableCaption : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_utils_document.thumbnail_impl_document.thumbnail', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/utils/document.thumbnail/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});


// Defines localizable strings in the default language (English)
csui.define('xecmpf/utils/document.thumbnail/impl/nls/root/lang',{
  open: 'Open',
  toOpen:'to open '
});



csui.define('css!xecmpf/utils/document.thumbnail/impl/document.thumbnail',[],function(){});
csui.define('xecmpf/utils/document.thumbnail/document.thumbnail.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette', 'csui/utils/url',
  'csui/utils/contexts/factories/connector',
  'csui/utils/nodesprites', 'csui/controls/node-type.icon/node-type.icon.view',
  'csui/behaviors/default.action/default.action.behavior',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'hbs!xecmpf/utils/document.thumbnail/impl/document.thumbnail',
  'i18n!xecmpf/utils/document.thumbnail/impl/nls/lang',
  'css!xecmpf/utils/document.thumbnail/impl/document.thumbnail'
], function (_, $, Marionette, Url,
    ConnectorFactory, NodeSpriteCollection, NodeTypeIconView, DefaultActionBehavior,TabKeyBehavior,
    template, lang) {

  var DocumentThumbnailView = Marionette.ItemView.extend({

    className: 'xecmpf-document-thumbnail',

    constructor: function DocumentThumbnailView(options) {
      options || (options = {});
      options.model || (options.model = options.node);
      Marionette.ItemView.prototype.constructor.apply(this, arguments);

      if (!this.model) {
        throw new Error('node is missing in the constructor options.');
      }
    },

    behaviors: {
      DefaultAction: {
        behaviorClass: DefaultActionBehavior
      },
      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },

    template: template,

    templateHelpers: function () {
      return {
        title: this.options.title || lang.open,
        document_name:lang.toOpen + this.options.model.get('name'),
        enableCaption: this.options.enableCaption
      };
    },

    ui: {
      thumbnailNotLoadedEl: '.thumbnail_not_loaded',
      imgEl: '.img-doc-preview',
      iconEl: '.csui-type-icon',
      buttonToHide:'.document-thumbnail-wrapper > button'
    },
    
    events:{
        'keydown .thumbnail_not_loaded': function(event){
            if (event.keyCode === 13 || event.keyCode === 32){
            var activeEl = this.$el.find(document.activeElement);
			$(activeEl).click();
            }
        },
        'keydown button.wrapper': function(event){
            if (event.keyCode === 13 || event.keyCode === 32){
            var activeEl = this.$el.find(document.activeElement);
			$(activeEl).click();
            }
        }
        
    },

    _showThumbnail: function () {
      // show thumbnail empty svg and hide img tag
      this.ui.thumbnailNotLoadedEl
          .addClass('thumbnail_empty')
          .removeClass('binf-hidden thumbnail_missing');
      this.ui.imgEl.addClass('binf-hidden');

      var that = this;
      this.model.connector
          .requestContentAuthToken({id: that.model.get('id')})
          .then(function (response) {
            var url;
            url = Url.combine(that.model.connector.connection.url, '/nodes', that.model.get('id'),
                '/thumbnails/medium/content?token=' + encodeURIComponent(response.token));

            if (typeof $ === 'function' && that.ui.imgEl instanceof $ &&
                that.ui.thumbnailNotLoadedEl instanceof $) {
              that.ui.imgEl.one('error', function () {
                // show thumbnail missing svg and hide img tag
                var className = NodeSpriteCollection.findClassByNode(that.model) ||
                                'thumbnail_missing';
                that.ui.thumbnailNotLoadedEl
                    .removeClass('binf-hidden thumbnail_empty')
                    .addClass(className);
                that.ui.imgEl.addClass('binf-hidden');
                that.ui.buttonToHide.addClass('binf-hidden');
                
              });

              that.ui.imgEl
                  .attr('src', url)
                  .one('load', function (evt) {
                    if (evt.target.clientHeight >= evt.target.clientWidth) {
                      that.ui.imgEl.addClass('cs-form-img-vertical');
                    } else {
                      that.ui.imgEl.addClass('cs-form-img-horizontal');
                    }

                    // hide the thumbnail background span and show the real img
                    that.ui.thumbnailNotLoadedEl.addClass('binf-hidden');
                    that.ui.imgEl
                        .removeClass('binf-hidden')
                        .addClass('cs-form-img-border');
                  });

              // default action
              that.ui.imgEl.parent().parent().click(function () {
                var args = {
                  model: that.model,
                  abortDefaultAction: false
                };
                that.triggerMethod('before:defaultAction', args);
                if (args.abortDefaultAction === false) {
                  that.triggerMethod('execute:DefaultAction', that.model);
                }
                that.triggerMethod('after:defaultAction', args);
              });
            }
          }, function () {
            if (typeof $ === 'function' && that.ui.imgEl instanceof $ &&
                that.ui.thumbnailNotLoadedEl instanceof $) {
              that.ui.imgEl.addClass('binf-hidden');
              that.ui.thumbnailNotLoadedEl
                  .removeClass('binf-hidden thumbnail_empty')
                  .addClass('csui-icon thumbnail_missing');
            }
          });
    },

    _renderNodeTypeIconView: function () {
      this._nodeIconView = new NodeTypeIconView({
        el: this.ui.iconEl,
        node: this.model
      });
      this._nodeIconView.render();
    },

    onRender: function () {
      this._renderNodeTypeIconView();
      this._showThumbnail();
    },

    onBeforeDestroy: function () {
      if (this._nodeIconView) {this._nodeIconView.destroy();}
    }
  });

  return DocumentThumbnailView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/dossier/impl/documentslistitem/impl/metadata',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<td class=\"label\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"label","hash":{}}) : helper)))
    + "\">"
    + this.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"label","hash":{}}) : helper)))
    + "</td>\r\n<td class=\"value\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{}}) : helper)))
    + "\">"
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{}}) : helper)))
    + "</td>";
}});
Handlebars.registerPartial('xecmpf_widgets_dossier_impl_documentslistitem_impl_metadata', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/dossier/impl/documentslistitem/impl/metadata.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/utils/base', 'hbs!xecmpf/widgets/dossier/impl/documentslistitem/impl/metadata'
], function (_, $, Backbone, Marionette, base,
    template) {

  var MetadataItemView = Marionette.ItemView.extend({

    tagName: 'tr',

    constructor: function MetadataItemView(options) {
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    template: template,

    templateHelpers: function () {
      var value = this.model.get('value');
      return {
        value: this.model.get('type') === 'Date' ? base.formatFriendlyDate(value) : value
      }
    }
  });

  var MetadataView = Marionette.CollectionView.extend({

    tagName: 'table',

    constructor: function MetadataView(options) {
      Marionette.CollectionView.prototype.constructor.apply(this, arguments);
    },

    childView: MetadataItemView
  });

  return MetadataView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/dossier/impl/documentslistitem/impl/documentslistitem',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div class=\"document-favorite\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.favorite : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0)})) != null ? stack1 : "")
    + "    </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "           <a href=\"#\" class=\"socialFav selected\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.removeFav || (depth0 != null ? depth0.removeFav : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"removeFav","hash":{}}) : helper)))
    + "\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.removeFav || (depth0 != null ? depth0.removeFav : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"removeFav","hash":{}}) : helper)))
    + "\">\r\n          <span class=\"icon icon-socialFav\"></span>\r\n        </a>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "        <a href=\"#\" class=\"socialFav notselected\" tabindex=\"0\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.addFav || (depth0 != null ? depth0.addFav : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"addFav","hash":{}}) : helper)))
    + "\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.addFav || (depth0 != null ? depth0.addFav : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"addFav","hash":{}}) : helper)))
    + "\">\r\n          <span class=\"icon icon-socialFavOpen\"></span>\r\n        </a>\r\n";
},"6":function(depth0,helpers,partials,data) {
    return "    <div class=\"document-category-attributes\"></div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"xecmpf-document-preview\"></div>\r\n\r\n<div class=\"xecmpf-document-metadata\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.hideFavorite : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.hideMetadata : depth0),{"name":"unless","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "</div>\r\n";
}});
Handlebars.registerPartial('xecmpf_widgets_dossier_impl_documentslistitem_impl_documentslistitem', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/dossier/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/dossier/impl/nls/root/lang',{
  searchPlaceholder: 'Search groups.',
  emptyListText: 'No documents.',
  groupByLabel: 'Group by',
  classificationLabel: 'Classification',
  createDateLabel: 'Creation date',
  documentTypeLabel: 'Document type',
  tilesLabel: 'group(s)',
  documentsLabel: 'document(s)',
  addFav: 'Add to favorite',
  removeFav: 'Remove from favorite',
  selectByClassificationLabel:'Select group by Classification',
  selectByCreatedateLabel:'Select group by Created Date'
});



csui.define('css!xecmpf/widgets/dossier/impl/documentslistitem/impl/documentslistitem',[],function(){});
csui.define('xecmpf/widgets/dossier/impl/documentslistitem/documentslistitem.view',['csui/lib/jquery', 'csui/lib/underscore', 'csui/lib/backbone', 'csui/lib/marionette',
  'conws/models/favorite.model',
  'xecmpf/utils/document.thumbnail/document.thumbnail.view',
  'xecmpf/widgets/dossier/impl/documentslistitem/impl/metadata.model',
  'xecmpf/widgets/dossier/impl/documentslistitem/impl/metadata.view',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'hbs!xecmpf/widgets/dossier/impl/documentslistitem/impl/documentslistitem',
  'i18n!xecmpf/widgets/dossier/impl/nls/lang',
  'css!xecmpf/widgets/dossier/impl/documentslistitem/impl/documentslistitem'
], function ($, _, Backbone, Marionette,
    FavoriteModel, DocumentThumbnailView, MetadataCollection, MetadataView,
    TabKeyBehavior,
    template, lang) {

  var DocumentsListItem;

  DocumentsListItem = Marionette.ItemView.extend({

    tagName: 'li',

    className: 'xecmpf-document-list-item',

    constructor: function DocumentsListItem(options) {
      options || (options = {});
      Marionette.ItemView.prototype.constructor.apply(this, arguments);

      this.favModel = new FavoriteModel({
            selected: this.model.get('favorite')
          },
          {
            connector: this.model.connector,
            node: this.model
          });
      this.listenTo(this.favModel, 'change:selected', this.render);
    },
    behiours: {
      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },
    
    template: template,

    templateHelpers: function () {
      return {
        enableIcon: true,
        hideMetadata: this.options.hideMetadata,
        hideFavorite: this.options.hideFavorite,
        addFav: lang.addFav + this.options.model.get('name'),
        removeFav: lang.removeFav + this.options.model.get('name')
      }
    },

    ui: {
      thumbnailEL: '.xecmpf-document-preview',
      metadataEl: '.document-category-attributes'
    },

    triggers: {
      'click a.socialFav.selected': 'remove:favorite',
      'click a.socialFav.notselected': 'add:favorite'
      
    },
    events:{
        'keydown a.socialFav.selected':function (event){
          if(event.keyCode === 13 || event.keyCode === 32){
          this.triggerMethod('remove:favorite');
          }
        },
             
      'keydown a.socialFav.notselected': function (event){
          if(event.keyCode === 13 || event.keyCode === 32){
         this.triggerMethod('add:favorite');
          }
        }
    },

    onRemoveFavorite: function (e) {
      this.favModel.remove();
      this.model.set('favorite', false);
      // Show directly that favorite was removed
      this.render();
    },

    onAddFavorite: function (e) {
      this.favModel.add();
      this.model.set('favorite', true);
      // Show directly that favorite was added
      this.render();
    },

    _renderMetadata: function () {
      var metadata_categories = this.model.get('metadata_categories');
      if (!_.isEmpty(metadata_categories)) {
        var metadataCollection = new MetadataCollection(undefined, {
          data: metadata_categories,
          hideEmptyFields: this.options.hideEmptyFields,
          catsAndAttrs: this.options.catsAndAttrs
        });
        this._metadataView = new MetadataView({collection: metadataCollection});
        this.ui.metadataEl.html(this._metadataView.render().el);
      }
    },

    _renderThumbnail: function () {
      this._documentThumbnailView = new DocumentThumbnailView({
        model: this.model,
        enableCaption: true
      });
      this.ui.thumbnailEL.html(this._documentThumbnailView.render().el);
    },

    onRender: function () {
      this._renderThumbnail();
      if (this.options.hideMetadata !== true) {
        this._renderMetadata();
      }
    },

    onBeforeDestroy: function () {
      this._documentThumbnailView.destroy();
      if (this._metadataView) {this._metadataView.destroy();}
    }
  });

  return DocumentsListItem;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/dossier/impl/documentslist/impl/documentslist',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class=\"xecmpf-document-list-group\"></ul>";
}});
Handlebars.registerPartial('xecmpf_widgets_dossier_impl_documentslist_impl_documentslist', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/widgets/dossier/impl/documentslist/impl/documentslist',[],function(){});
csui.define('xecmpf/widgets/dossier/impl/documentslist/documentslist.view',['csui/lib/jquery', 'csui/lib/underscore', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/controls/tile/behaviors/infinite.scrolling.behavior',
  'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'csui/controls/tile/behaviors/blocking.behavior',
  'csui/controls/tile/tile.view',
  'csui/controls/list/emptylist.view',
  'xecmpf/widgets/dossier/impl/documentslist/impl/documents.model',
  'xecmpf/widgets/dossier/impl/documentslistitem/documentslistitem.view',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'i18n!xecmpf/widgets/dossier/impl/nls/lang',
  'hbs!xecmpf/widgets/dossier/impl/documentslist/impl/documentslist',
  'css!xecmpf/widgets/dossier/impl/documentslist/impl/documentslist'
], function ($, _, Backbone, Marionette,
    InfiniteScrollingBehavior, PerfectScrollingBehavior, BlockingBehavior,
    TileView, EmptyListView, DocumentsCollection, DocumentsListItem,
    TabKeyBehavior,
    lang, template) {

  var DocumentsListView, DocumentsTileView;
  
  DocumentsListView = Marionette.CompositeView.extend({

    className: 'list-group-container',

    constructor: function DocumentsListView(options) {
      options || (options = {});
      Marionette.CompositeView.prototype.constructor.apply(this, arguments);
    },

    template: template,

    behaviors: {
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        suppressScrollX: true,
        scrollYMarginOffset: 15
      },

      InfiniteScrolling: {
        behaviorClass: InfiniteScrollingBehavior,
        content: '>ul.xecmpf-document-list-group',
        fetchMoreItemsThreshold: 80
      }
    },

    childViewContainer: '>ul.xecmpf-document-list-group',

    childView: DocumentsListItem,

    childViewOptions: function () {
      return {
        context: this.options.context,
        workspaceContext: this.options.workspaceContext,
        nodeModel: this.options.nodeModel,
        hideMetadata: this.options.hideMetadata,
        hideEmptyFields: this.options.hideEmptyFields,
        hideFavorite: this.options.hideFavorite,
        catsAndAttrs: this.options.catsAndAttrs
      }
    },

    emptyView: EmptyListView,

    emptyViewOptions: {
      text: lang.emptyListText || 'No documents.'
    },

    onRender: function () {
      // this is important to make the perfect scrolling work.
      this.$el.one('mouseenter', $.proxy(function () {
        this.triggerMethod("dom:refresh");
      }, this))
    }
  });

  DocumentsTileView = TileView.extend({

    className: function () {
      var className       = 'xecmpf-documents-tile',
          parentClassName = _.result(TileView.prototype, 'className');
      if (parentClassName) {
        className += ' ' + parentClassName;
      }
      return className;
    },
    _focusedChild: undefined,
    _activeChild: undefined,
    constructor: function DocumentsTileView(options) {
      options || (options = {});
      TileView.prototype.constructor.apply(this, arguments);
      this.childrens = DocumentsListView
    },

    templateHelpers: function () {
      var title = this.model && this.model.get('name');
      return {
        title: title,
        icon: false
      };
    },

    behaviors: {
      Blocking: {
        behaviorClass: BlockingBehavior
      },
      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },
    _accSelector: '.thumbnail_not_loaded',
    
    currentlyFocusedElement: function () {
      return this.$(this._accSelector);
    },
    
    getActiveChild: function(){
      return this._activeChild;
    },
    toggleFocus: function (on) {
      this.ui.listItem.prop('tabindex', on === true ? '0' : '-1'); // set or remove tabstop
      if (on) {
        this.ui.listItem.focus(); // if tabstop then set focus too
      }
      // this._focusOnTree = false;
    },
    contentView: DocumentsListView,

    contentViewOptions: function () {
      var queryParams = _.extend(this.options.model && this.options.model.get('query_params'), {
            metadata_categories: this.options.metadata_categories
          }),
          models      = this.options.model && this.options.model.get('documents'),
          paging      = this.options.model && this.options.model.get('paging');

      var collection = new DocumentsCollection(models, {
        nodeModel: this.options.nodeModel,
        query: queryParams,
        paging: paging
      });

      // Loading animation
      this.listenTo(collection, "request", this.blockActions)
          .listenTo(collection, "sync", this.unblockActions)
          .listenTo(collection, "error", this.unblockActions);

      return {
        collection: collection,
        context: this.options.context,
        workspaceContext: this.options.workspaceContext,
        nodeModel: this.options.nodeModel,
        hideMetadata: this.options.hideMetadata,
        hideEmptyFields: this.options.hideEmptyFields,
        hideFavorite: this.options.hideFavorite,
        catsAndAttrs: this.options.catsAndAttrs
      }
    },

    _renderTileProperties: function () {
      var docsCount = (this.model && this.model.get('paging').total_count) || '0',
          $tilePropEl, $docsCountLabel;

      this.$docsCountEl = $('<span></span>')
          .addClass('count docs-count')
          .text(docsCount);
      $docsCountLabel = $('<span></span>')
          .addClass('count-label')
          .text(lang.documentsLabel || 'document(s)');

      $tilePropEl = $('<div></div>')
          .addClass('tile-properties')
          .append(this.$docsCountEl).append($docsCountLabel);

      this.$('>.tile-header').append($tilePropEl);
    },

    onRender: function () {
      this._renderTileProperties();
    },

    onBeforeShow: function () {
      this.listenTo(this.contentView, 'execute:defaultAction', function (node) {
        this.triggerMethod('execute:defaultAction', node);
      });
    }
  });

  return DocumentsTileView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/dropdown/impl/dropdownitem',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<a href=\"#\" tabindex=\"-1\">"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{}}) : helper)))
    + "</a>";
}});
Handlebars.registerPartial('xecmpf_controls_dropdown_impl_dropdownitem', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/controls/dropdown/dropdownitem.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'hbs!xecmpf/controls/dropdown/impl/dropdownitem'
], function (_, $, Backbone, Marionette,
    template) {

  var DropdownItemView;

  DropdownItemView = Marionette.ItemView.extend({

    className: 'dropdown-menu-item',

    tagName: 'li',

    constructor: function DropdownItemView(options) {
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    template: template,

    triggers: {
      'click': 'click:item'
    },

    modelEvents: {
      'change': 'render'
    }
  });

  return DropdownItemView;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/dropdown/impl/dropdown',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<a class=\"binf-dropdown-toggle csui-acc-focusable\" role=\"button\"\r\n        data-binf-toggle=\"dropdown\" aria-expanded=\"false\" tabindex=\"-1\">\r\n  <span class=\"dropdown-label\">"
    + this.escapeExpression(((helper = (helper = helpers.dropdownLabel || (depth0 != null ? depth0.dropdownLabel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"dropdownLabel","hash":{}}) : helper)))
    + "</span>\r\n  <span class=\"csui-button-icon icon-expandArrowDown\"></span>\r\n</a>\r\n<ul class=\"binf-dropdown-menu\" role=\"menu\"></ul>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_dropdown_impl_dropdown', t);
return t;
});
/* END_TEMPLATE */
;

csui.define('css!xecmpf/controls/dropdown/impl/dropdown',[],function(){});
csui.define('xecmpf/controls/dropdown/dropdown.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/lib/binf/js/binf',
  'xecmpf/controls/dropdown/dropdownitem.view',
  'hbs!xecmpf/controls/dropdown/impl/dropdown',
  'css!xecmpf/controls/dropdown/impl/dropdown'
], function (_, $, Backbone, Marionette, BinfJS,
    DropdownItemView, template, css) {

  var DropdownView;

  DropdownView = Marionette.CompositeView.extend({

    className: 'xecmpf-dropdown binf-dropdown',

    constructor: function DropdownView(options) {
      options || (options = {});
      Marionette.CompositeView.prototype.constructor.apply(this, arguments);
      this.label = this.options.label;
    },

    template: template,

    templateHelpers: function () {
      return {
        dropdownLabel: this.label || 'Dropdown'
      }
    },

    ui: {
      control: '.binf-dropdown-toggle',
      label: '.dropdown-label'
    },

    childView: DropdownItemView,

    childViewContainer: 'ul.binf-dropdown-menu',

    childEvents: {
      'render': 'onRenderChild',
      'click:item': 'onClickItem'
    },

    onRenderChild: function (childView) {
      var currModel = childView.model;
      if (currModel.get('active') === true) {
        childView.$el
            .addClass('binf-active')
            .siblings().removeClass('binf-active');
        this.currModel = currModel;
      }
      if (currModel.get('hide') === true) {
        childView.$el.addClass('binf-hidden');
      }
    },

    onClickItem: function (childView) {
      if (!childView.$el.hasClass('binf-active')) {
        var newModel = childView.model,
            args     = {
              currModel: this.currModel,
              newModel: newModel
            };
        this.triggerMethod('change:dropdown:item', args);
        if (args.change !== false) {
          childView.$el
              .addClass('binf-active')
              .siblings().removeClass('binf-active');
          this.currModel = newModel;
        }
        this.hideDropdownMenu();
      }
    },

    showDropdownMenu: function () {
      this.$el.addClass('binf-open');
      this.ui.control.attr('aria-expanded', true);
    },

    hideDropdownMenu: function () {
      this.$el.removeClass('binf-open');
      this.ui.control.attr('aria-expanded', false);
    },

    updateLabel: function (newLabel) {
      if (newLabel && typeof newLabel === 'string') {
        this.ui.label.text(newLabel);
      }
    },

    setModelActive: function (model) {
      if (model instanceof Backbone.Model) {
        model.unset('active', {silent: true});
        model.set('active', true);
      }
    },

    setModelHide: function (model) {
      if (model instanceof Backbone.Model) {
        model.unset('hide', {silent: true});
        model.set('hide', true);
      }
    },

    onRender: function () {
      this.ui.control.binf_dropdown();
    }
  });

  return DropdownView;
});

csui.define('xecmpf/widgets/dossier/impl/dropdown.items',['module', 'csui/lib/backbone', 'i18n!xecmpf/widgets/dossier/impl/nls/lang'
], function (module, Backbone, lang) {
  var config = module.config(),
      DropdownItemModel,
      DropdownItemCollection,
      dropdownItems;

  DropdownItemModel = Backbone.Model.extend({

    idAttribute: "value",

    defaults: {
      value: null,
      name: null,
      sequence: 0 // smaller number moves up
    }
  });

  DropdownItemCollection = Backbone.Collection.extend({

    model: DropdownItemModel,
    comparator: 'sequence',

    getItemValues: function () {
      return this.pluck('value');
    },

    deepClone: function () {
      return new DropdownItemCollection(
          this.map(function (item) {
            return item.attributes;
          }));
    }

  });

  dropdownItems = new DropdownItemCollection([
    {
      value: 'classification',
      name: config.groupByDocumentType ?
            lang.documentTypeLabel : lang.classificationLabel,
      sequence: 10
    },
    {
      value: 'create_date',
      name: lang.createDateLabel,
      sequence: 20
    }
  ]);

  return dropdownItems;
});


csui.define('css!xecmpf/widgets/dossier/impl/dossier',[],function(){});
csui.define('xecmpf/widgets/dossier/dossier.view',['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/utils/contexts/factories/node', 'conws/models/workspacecontext/workspacecontext.factory',
  'xecmpf/widgets/dossier/impl/dossier.factory',
  'csui/controls/tile/behaviors/blocking.behavior', 'csui/behaviors/limiting/limiting.behavior',
  'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'xecmpf/behaviors/scroll.controls/scroll.controls.behavior',
  'csui/controls/list/behaviors/list.view.keyboard.behavior',
  'csui/dialogs/modal.alert/modal.alert',
  'csui/controls/list/list.view', 'xecmpf/widgets/dossier/impl/documentslist/documentslist.view',
  'xecmpf/controls/dropdown/dropdown.view',
  'xecmpf/widgets/dossier/impl/dropdown.items',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'i18n!xecmpf/widgets/dossier/impl/nls/lang',
  'css!xecmpf/widgets/dossier/impl/dossier'
], function (_, $, Backbone, Marionette,
    NodeModelFactory, WorkspaceContextFactory, DossierFactory,
    BlockingBehavior, LimitingBehavior, PerfectScrollingBehavior,
    ScrollControlsBehavior, ListViewKeyboardBehavior, ModalAlert,
    ListView, DocumentsListView, DropdownView,
    dropdownMenuItems, TabKeyBehavior, lang) {

  var DossierView;

  DossierView = ListView.extend({

    id: 'xecmpf-dossier',

    constructor: function DossierView(options) {
      options || (options = {});
      options = options.data ? _.extend(options, options.data) : options;
      if (!options.workspaceContext) {
        if (options.context) {
          options.workspaceContext = options.context.getObject(WorkspaceContextFactory);
        } else {
          throw new Error('Context is missing in the constructor options!');
        }
      }
      options.workspaceContext.setWorkspaceSpecific(DossierFactory);
      ListView.prototype.constructor.apply(this, arguments);

      this.listenTo(this.completeCollection, 'request', this.blockActions)
          .listenTo(this.completeCollection, 'error', this.unblockActions)
          .listenTo(this.completeCollection, 'sync', this.onCompleteCollectionSync);

      this.synced = false;
    },

    templateHelpers: function () {
      return {
        icon: undefined,
        title: undefined,
        searchPlaceholder: lang.searchPlaceholder
      };
    },

        events: {
            'focus span[title="Search"]': function () {
                var dropdown = this.$el.find('.xecmpf-dropdown');
                dropdown.removeClass('binf-open');
            },

            'keydown .clearer': function () {
                var searchInput = this.$('.search');
                searchInput.val('');
                searchInput.focus();
                this.filterChanged();
            },

            'keydown li.dropdown-menu-item': function () {
                if (event.keyCode === 13 || event.keyCode === 32) {
                    $('.dropdown-menu-item').click();
                    var dropdown = this.$el.find('.xecmpf-dropdown');
                    dropdown.removeClass('binf-open');
                }
            },
            'keydown .dossier-dropdown': 'getDossierViewFilter',
            'keydown .tile-header span[title="Search"]': function (event) {
                if (event.keyCode === 13 || event.keyCode === 32) {
                    $('.tile-header span[title="Search"]').click();
                }
            },
            'keydown .tile-header input[class="search"]': function (event) {
                if (event.keyCode === 27) {
                    $('.tile-header span[title="Hide"]').click();
                    $('.tile-header span[title="Hide"]').focus();
                }
            }
        },
    behaviors: {
      LimitedList: {
        behaviorClass: LimitingBehavior,
        // never show expand icon
        limit: undefined,
        completeCollection: function () {
          this.nodeModel = this.options.workspaceContext.getObject(NodeModelFactory);
          this.groupBy = this.options.groupBy;

          (function (metadata, ctx) {
            metadata || (metadata = []);
            ctx.metadata_categories = '';
            ctx.catsAndAttrs = [];
            if (metadata.length > 0) {
              var categories = '', catsAndAttrs = [];
              metadata.forEach(function (item) {
                if (item.attributeId) {
                  categories += item.categoryId + ',';
                  catsAndAttrs.push(item.categoryId + '_' + item.attributeId);
                } else if (item.categoryId) {
                  categories += item.categoryId + ',';
                  catsAndAttrs.push(item.categoryId);
                }
              });
              ctx.metadata_categories = categories.substr(0, categories.length - 1);
              ctx.catsAndAttrs = catsAndAttrs;
            }
          })(this.options.metadata, this);
          return this.options.workspaceContext.getCollection(DossierFactory, {
            options: {
              nodeModel: this.nodeModel,
              query: {
                group_by: this.groupBy,
                metadata_categories: this.metadata_categories
              }
            }
          });
        }
      },

      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        // disable the PerfectScrolling because ScrollControlsBehavior will be used for scrolling.
        scrollingDisabled: true
      },

      ScrollControls: {
        behaviorClass: ScrollControlsBehavior,
        controlsContainer: '>.tile-content',
        contentParent: '>.tile-content>.binf-list-group',
        animateDuration: 500, //ms
        scrollableWidth: function () { //px
          var contentParentWidth = this.$('>.tile-content').innerWidth(),
              // tileWidth: width of a tile including border, padding and margin.
              tileWidth          = this.$('>.tile-content>.binf-list-group>.tile').outerWidth(true),
              // tilesInView: number of completely visible tiles.
              tilesInView        = Math.floor(contentParentWidth / tileWidth),
              // scrollableWidth: width of completely visible tiles.
              scrollableWidth    = (tilesInView * tileWidth) || tileWidth;
          return scrollableWidth;
        },
        leftControlIconClass: 'caret-left',
        rightControlIconClass: 'caret-right'
      },

      Blocking: {
        behaviorClass: BlockingBehavior
      },

      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },

    getDossierViewFilter: function (e) {
      switch (e.keyCode) {
      case 13:  // enter

      case 32:  // space
          
          var dropdown = this.$el.find('.xecmpf-dropdown');
          dropdown.hasClass('binf-open') ? dropdown.removeClass('binf-open') : dropdown.addClass('binf-open');

          break;
          
          //xecmpf-dropdown binf-dropdown
      }
    },

    childView: DocumentsListView,

    childViewOptions: function () {
      return {
        context: this.options.context,
        workspaceContext: this.options.workspaceContext,
        nodeModel: this.nodeModel,
        hideMetadata: this.options.hideMetadata,
        hideEmptyFields: this.options.hideEmptyFields,
        metadata_categories: this.metadata_categories,
        hideFavorite: this.options.hideFavorite,
        catsAndAttrs: this.catsAndAttrs
      }
    },

    onRenderTemplate: function () {
      if (this.options.hideGroupByCriterionDropdown !== true) {
        this._renderGroupByDropdownView();
      }
      this._renderDossierProperties();
    },

    onRenderCollection: function () {
      this.triggerMethod('update:scroll:controls');
    },

    onCompleteCollectionSync: function () {
      this.synced = true;
      this._updateDossierProperties();
      this.unblockActions();
    },

    isEmpty: function () {
      return (this.synced === true) && (this.collection.models.length === 0);
    },

    emptyViewOptions: {
      text: lang.emptyListText || "No documents."
    },

    _renderGroupByDropdownView: function () {
      var $dropdownEl = $('<div></div>')
          .addClass('dossier-dropdown-wrapper');
      var $dropdownLabel = $('<span></span>')
          .addClass('dossier-dropdown-label')
          .text(lang.groupByLabel);
      var $dropdown = $('<div></div>')
          .addClass('dossier-dropdown');
      $dropdownEl
          .append($dropdownLabel)
          .append($dropdown);

      this.$('>.tile-header>.tile-controls').prepend($dropdownEl);

      var dropdownRegion = new Marionette.Region({el: $dropdown});

      this.groupBydropdownView = new DropdownView({
        label: this._getGroupByDropdownLabel(dropdownMenuItems),
        collection: dropdownMenuItems
      });

      this.listenTo(this.groupBydropdownView, 'change:dropdown:item', function (args) {
        // re-fetch the completeCollection according to the selected group_by criterion.
        var value = args.newModel.get('value'),
            that  = this;
        this.synced = false;
        this.completeCollection
            .fetch({
              query: {
                group_by: value,
                metadata_categories: this.metadata_categories
              }
            })
            .done(function (response, status, jqXHR) {
              that.groupBy = value;
              that.groupBydropdownView.updateLabel(that._getGroupByDropdownLabel(args.newModel));
              // move the scroll to initial position
              var $scrollEl = that.$('>.tile-content>.binf-list-group');
              $scrollEl.scrollLeft(0);
              that.triggerMethod('update:scroll:controls');
              that._setGroupByDropdownModelActive(that.groupBydropdownView.collection);
            })
            .fail(function (jqXHR, status, error) {
              var errMsg = jqXHR.responseJSON ? jqXHR.responseJSON.error :
                           'Internal Server Error!';
              ModalAlert
                  .showError(errMsg)
                  .always(function () {
                    that._setGroupByDropdownModelActive(args.currModel);
                  });
            });
      });
      dropdownRegion.show(this.groupBydropdownView);
      this._setGroupByDropdownModelActive(dropdownMenuItems);
    },

    _getGroupByDropdownLabel: function (arg) {
      var label = /*lang.groupByLabelPrefix +*/ ' ',
          dropdownActiveModel;
      if (arg instanceof Backbone.Model) {
        dropdownActiveModel = arg;
      } else if (arg instanceof Backbone.Collection) {
        dropdownActiveModel = this._getGroupByDropdownActiveModel(arg);
      }

      if (dropdownActiveModel) {
        label += dropdownActiveModel.get('name');
      }
      return label;
    },

    _getGroupByDropdownActiveModel: function (collection) {
      if (collection instanceof Backbone.Collection) {
        return collection.find($.proxy(function (model) {
          return model.get('value') === this.groupBy;
        }, this));
      }
    },

    _setGroupByDropdownModelActive: function (arg) {
      var activeModel;
      if (arg instanceof Backbone.Model) {
        activeModel = arg;
      } else if (arg instanceof Backbone.Collection) {
        activeModel = this._getGroupByDropdownActiveModel(arg);
      }

      if (activeModel) {
        this.groupBydropdownView.setModelActive(activeModel);
      }
    },

    _renderDossierProperties: function () {
      var tilesCount = this.completeCollection.length || '0',
          docsCount  = this.completeCollection.total_documents || '0',
          $dossierPropEl, $tilesCountLabel, $docsCountLabel;

      this.$tilesCountEl = $('<span></span>')
          .addClass('count tiles-count')
          .text(tilesCount);
      $tilesCountLabel = $('<span></span>')
          .addClass('count-label')
          .text(lang.tilesLabel || 'group(s)');

      this.$docsCountEl = $('<span></span>')
          .addClass('count docs-count')
          .text(docsCount);
      $docsCountLabel = $('<span></span>')
          .addClass('count-label')
          .text(lang.documentsLabel || 'document(s)');

      $dossierPropEl = $('<div></div>')
          .addClass('dossier-properties')
          .append(this.$tilesCountEl).append($tilesCountLabel)
          .append(this.$docsCountEl).append($docsCountLabel);
        
        var _dropdownElement = this.$('.dossier-dropdown .csui-acc-focusable').get(0);
        _dropdownElement.setAttribute('tabindex', '0');
        var groupBy = this.groupBy;
        var toolTop
        if(groupBy === 'create_date'){
            toolTop = lang.selectByClassificationLabel;
        }
        else{
            toolTop = lang.selectByCreatedateLabel;
        }
        _dropdownElement.setAttribute('aria-label', toolTop);
        this.$('>.tile-header>.tile-title').remove();
        this.$('>.tile-header').prepend($dossierPropEl);
        
         var searchButton = this.$('>.tile-header span[title="Search"]');
		 $(searchButton).addClass('csui-acc-focusable');
		  $(searchButton).attr('tabindex','0');
        
    },

    _updateDossierProperties: function () {
      var activeTiles =_.filter(this.completeCollection.models,function(model){
          return model.attributes.documents;
      });
      var tilesCount = activeTiles.length,
          docsCount  = this.completeCollection.total_documents;
      this.$tilesCountEl.text(tilesCount);
      this.$docsCountEl.text(docsCount);
    }
  });

  return DossierView;
});

csui.define('xecmpf/models/eac/eventactionplans.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/node',
  'xecmpf/models/eac/eventactionplans.model'
], function (module, _, Backbone,
  CollectionFactory, NodeFactory, EACEventActionPlans) {

    var EACEventActionPlansFactory = CollectionFactory.extend({

      propertyPrefix: 'EACEventActionPlans',

      constructor: function EACEventActionPlansFactory(context, options) {
        CollectionFactory.prototype.constructor.apply(this, arguments);
        var eacEventActionPlans = this.options.EACEventActionPlans || {};

        if (!(eacEventActionPlans instanceof Backbone.Collection)) {
          var node = context.getModel(NodeFactory, options), config = module.config();

          eacEventActionPlans = new EACEventActionPlans(eacEventActionPlans.models, _.extend({
            node: node,
            connector: node.connector,
            extSysTypes: options.extSysTypes
          }, eacEventActionPlans.options, config.options, {
              autofetch: true
            }));
        }

        this.property = eacEventActionPlans;
      },

      fetch: function (options) {
        return this.property.fetch(options);
      }
    });

    return EACEventActionPlansFactory;
  });

csui.define('xecmpf/models/eac/nodefacets.model',['csui/lib/underscore', 'csui/utils/url', 'csui/models/facets',
  'csui/models/mixins/node.resource/node.resource.mixin',
  'csui/models/node.facets/server.adaptor.mixin',
  'csui/utils/deepClone/deepClone'
], function (_, Url, FacetCollection, NodeResourceMixin, ServerAdaptorMixin) {
  'use strict';

  var EACFacetCollection = FacetCollection.extend({
    constructor: function EACFacetCollection(models, options) {
      FacetCollection.prototype.constructor.apply(this, arguments);
      this.makeNodeResource(options)
        .makeServerAdaptor(options);
    },
    clone: function () {
      return new this.constructor(this.models, {
        node: this.node,
        filters: _.deepClone(this.filters)
      });
    }
  });

  NodeResourceMixin.mixin(EACFacetCollection.prototype);
  ServerAdaptorMixin.mixin(EACFacetCollection.prototype);

  EACFacetCollection.prototype.url = function () {
    var nodeId = this.node.get('id'),
      filter = this.getFilterQuery(this.filters),
      url = Url.combine(this.connector.connection.url, 'eventactioncenter', '/facets').replace('/v1', '/v2');
    if (filter) {
      url += '?' + filter;
    }
    return url;
  };

  return EACFacetCollection;
});

csui.define('xecmpf/models/eac/node.facet.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/node',
  'xecmpf/models/eac/nodefacets.model'
], function (module, _, Backbone, CollectionFactory, NodeModelFactory, NodeFacetCollection) {

  var FacetCollectionFactory = CollectionFactory.extend({

    propertyPrefix: 'eacfacets',

    constructor: function FacetCollectionFactory(context, options) {
      CollectionFactory.prototype.constructor.apply(this, arguments);

      var facets = this.options.eacfacets || {};
      if (!(facets instanceof Backbone.Collection)) {
        var node = facets.options && facets.options.node ||
          context.getModel(NodeModelFactory, options),
          config = module.config();
        facets = new NodeFacetCollection(facets.models, _.defaults(
          config.options,
          facets.options,
          {
            autoreset: true
          },
          { node: node }
        ));
      }
      this.property = facets;
    },

    fetch: function (options) {
      return this.property.fetch(options);
    }

  });

  return FacetCollectionFactory;

});

csui.define('xecmpf/widgets/eac/impl/eac.table.columns',['csui/lib/underscore', 'csui/lib/backbone', 'i18n!xecmpf/widgets/eac/impl/nls/lang'

], function (_, Backbone, lang) {
  'use strict';

  var TableColumnModel = Backbone.Model.extend({

    idAttribute: "key",

    defaults: {
      key: null,
      sequence: 0
    }

  });

  var TableColumnCollection = Backbone.Collection.extend({

    model: TableColumnModel,

    comparator: "sequence",

    getColumnKeys: function () {
      return this.pluck('key');
    },

    deepClone: function () {
      return new TableColumnCollection(
        this.map(function (column) {
          return column.attributes;
        }));
    },

    resetCollection: function (columns, options) {
      if (columns) {
        var sequence = 0;
        var models = _.map(columns, function (column) {
          var columnData = column instanceof Backbone.Model ? column.toJSON() : column;
          sequence += 10;
          return new TableColumnModel(_.defaults(columnData,
            { key: columnData.column_key, sequence: sequence }));
        });
        this.reset(models, options);
      }
    }

  });

  var tableColumns = new TableColumnCollection([
    {
      key: 'event_name',
      title: lang.columnEventName,
      sequence: 10,
      permanentColumn: true
    },
    {
      key: 'namespace',
      title: lang.columnSystemName,
      sequence: 20,
      permanentColumn: true
    },
    {
      key: 'action_plan',
      title: lang.columnActionPlan,
      sequence: 30,
      permanentColumn: true
    }
  ]);

  return tableColumns;
});

csui.define('xecmpf/widgets/eac/impl/toolbaritems',['csui/controls/toolbar/toolitems.factory',
  'i18n!xecmpf/widgets/eac/impl/nls/lang',
  'css!xecmpf/widgets/eac/impl/eac'
], function (ToolItemsFactory, lang) {

  // Keep the keys in sync with csui/widgets/nodestable/toolbaritems.masks
  var toolbarItems = {

    leftToolbar: {
      OtherToolbar: new ToolItemsFactory({
        main: [{
          signature: "EACBack",
          name: lang.ToolbarItemBack,
          toolItemAria: lang.ToolbarItemBackAria,
          icon: "icon icon-arrowBack"

        }, {
          signature: "Filter",
          name: lang.ToolbarItemFilter,
          icon: "icon icon-toolbarFilter",
          toolItemAria: lang.ToolbarItemFilterAria,
          toolItemAriaExpand: false
        }]
      })
    },


    rightToolbar: {
      OtherToolbar: new ToolItemsFactory({
        main: [{
          signature: "EACRefresh",
          name: lang.ToolbarItemRefresh,
          icon: "icon icon-refresh",
          toolItemAria: lang.ToolbarItemRefreshAria,
          commandData: { useContainer: true }
        }]
      })
    }
  };
  return toolbarItems;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/eac/impl/eac',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"xecmpf-eac-toolbar\"></div>\r\n<div id=\"xecmpf-eac-facet-table-container\">\r\n  <div id=\"xecmpf-eac-facet\" class=\"csui-table-facetview csui-facetview-hidden csui-facetview-visibility\"></div>\r\n  <div class=\"csui-outertablecontainer\">\r\n    <div id=\"xecmpf-eac-table-container\">\r\n      <div id=\"xecmpf-eac-facet-bar\"></div>\r\n      <div id=\"xecmpf-eac-table-contents\"></div>\r\n      <div id=\"xecmpf-eac-pagination\"></div>\r\n    </div>\r\n  </div>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_widgets_eac_impl_eac', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/eac/eac.view',['require', 'module', 'csui/lib/underscore', 'csui/lib/marionette',
    'csui/utils/contexts/factories/connector', 'csui/utils/contexts/factories/node',
    'csui/controls/progressblocker/blocker',
    'csui/controls/table/table.view',
    'xecmpf/models/eac/eventactionplans.factory',
    'xecmpf/models/eac/node.facet.factory',
    'csui/controls/facet.bar/facet.bar.view',
    'xecmpf/controls/dialogheader/dialogheader.view',
    'xecmpf/controls/title/title.view',
    'xecmpf/widgets/eac/impl/eac.table.columns',
    'xecmpf/controls/headertoolbar/headertoolbar.view',
    'xecmpf/widgets/eac/impl/toolbaritems',
    'csui/utils/commands',
    'csui/controls/facet.panel/facet.panel.view',
    'csui/utils/contexts/factories/node',
    'xecmpf/models/eac/eventactionplans.model',
    'csui/controls/toolbar/toolbar.command.controller',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'hbs!xecmpf/widgets/eac/impl/eac',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac',
],
        function (require, module, _, Marionette,
                ConnectorFactory, NodeModelFactory,
                BlockingView,
                TableView,
                EACEventActionPlansFactory,
                EACFacetFactory,
                FacetBarView,
                HeaderView,
                TitleView,
                eacTableColumns,
                HeaderToolbarView,
                toolbarItems,
                commands,
                FacetPanelView,
                NodeFactory,
                EACEventActionPlans,
                ToolbarCommandController,
                TabKeyBehavior,
                template, lang) {

            var config = module.config();
            _.defaults(config, {
                defaultPageSize: 30
            });

            var EACView = Marionette.LayoutView.extend({

                className: 'xecmpf-eac csui-nodestable',

                template: template,

                ui: {
                    facetView: '.csui-table-facetview'
                },

                regions: {
                    toolbarRegion: '#xecmpf-eac-toolbar',
                    facetRegion: '#xecmpf-eac-facet',
                    facetBarRegion: '#xecmpf-eac-facet-bar',
                    tableRegion: '#xecmpf-eac-table-contents',
                    paginationRegion: '#xecmpf-eac-pagination'
                },

                events: {
                    'click li[data-csui-command="eacback"]': function (event) {
                        if (history.state) {
                            history.back();
                        }
                    }
                },
                behaviors: {
                    TabKeyRegion: {
                        behaviorClass: TabKeyBehavior
                    }
                },

                constructor: function EACView(options) {
                    options || (options = {});
                    options = options.data ? _.extend(options, options.data) : options;
                    _.defaults(options, {
                        pageSize: config.defaultPageSize
                    });

                    if (!options.context) {
                        throw new Error('Context is missing in the constructor options');
                    }

                    BlockingView.imbue(this);
                    Marionette.LayoutView.prototype.constructor.apply(this, arguments);
                    this.connector = options.connector || options.context.getObject(ConnectorFactory);
                },

                initialize: function (options) {
                    this.node = options.context.getModel(NodeModelFactory, options);
                    this.collection = options.context.getCollection(EACEventActionPlansFactory, options);
                    this.commands = options.commands || commands;

                    this.commandController = new ToolbarCommandController({
                        commands: this.commands
                    });
                    this.listenTo(this.commandController, 'after:execute:command', this._toolbarActionTriggered);

                    this.setHeaderView();
                    this.setFacetView();
                    this.setFacetBarView();
                    this.setTableView();
                },

                setFacetView: function () {
                    this.facetFilters = this.options.facetFilters || this.options.context.getCollection(EACFacetFactory, {
                        options: {
                            node: this.node
                        },
                        attributes: this.options.data.containerId ? {id: this.options.data.containerId} : undefined,
                        detached: true
                    });
                    this.listenToOnce(this.options.context, 'request', function () {
                        this.facetFilters.fetch();
                    });

                    this.facetView = new FacetPanelView({
                        collection: this.facetFilters,
                        blockingLocal: true
                    });

                    this.listenTo(this.facetView, {
                        'remove:filter': this._removeFacetFilter,
                        'remove:all': this._removeAll,
                        'apply:filter': this._addToFacetFilter,
                        'apply:all': this._setFacetFilter
                    });
                },

                setFacetBarView: function () {
                    this.facetBarView = new FacetBarView({
                        collection: this.facetFilters,
                        context: this.options.context,
                        showSaveFilter: false
                    });
                    this.listenTo(this.facetBarView, 'remove:filter', this._removeFacetFilter)
                            .listenTo(this.facetBarView, 'remove:all', this._removeAll)
                            .listenTo(this.facetBarView, 'facet:bar:visible', this._handleFacetBarVisible)
                            .listenTo(this.facetBarView, 'facet:bar:hidden', this._handleFacetBarHidden);
                },

                setHeaderView: function () {
                    var leftToolbar = new HeaderToolbarView({
                        commands: commands,
                        originatingView: this,
                        context: this.options.context,
                        collection: this.collection,
                        toolbarItems: toolbarItems.leftToolbar,
                        container: this.node,
                        commandController: this.commandController
                    });

                    var titleView = new TitleView({title: lang.dialogTitle});

                    var rightToolbar = new HeaderToolbarView({
                        commands: commands,
                        originatingView: this,
                        context: this.options.context,
                        collection: this.collection,
                        toolbarItems: toolbarItems.rightToolbar,
                        container: this.node,
                        commandController: this.commandController
                    });

                    this.headerView = new HeaderView({
                        leftView: leftToolbar,
                        centerView: titleView,
                        hideDialogClose: true,
                        rightView: rightToolbar
                    });
                },

                setTableView: function () {
                    this.tableView = new TableView({
                        context: this.options.context,
                        connector: this.connector,
                        collection: this.collection,
                        columns: this.collection.columns,
                        tableColumns: eacTableColumns.clone(),
                        pageSize: this.options.pageSize,
                        originatingView: this,
                        columnsWithSearch: ['event_name'],
                        orderBy: this.options.data.orderBy || this.options.orderBy || 'event_name desc',
                        blockingParentView: this,
                        parentView: this,
                        selectColumn: false,
                        selectRows: 'none',
                        tableTexts: {
                            zeroRecords: lang.emptyTableText || 'No results found'
                        },
                        haveToggleAllDetailsRows: false,
                        haveDetailsRowExpandCollapseColumn: false,
                    });

                },

                onRender: function () {

                    if (!history.state) {
                        var backbutton = this.$el.find('li[data-csui-command="eacback"]');
                        backbutton.css({"display": "none"});
                    }
                    this.listenTo(this.collection, 'sync', function () {
                        this.setTableView();
                        this.showChildView('tableRegion', this.tableView);
                        this.showChildView('toolbarRegion', this.headerView);
                        this.showChildView('facetRegion', this.facetView);
                        this.showChildView('facetBarRegion', this.facetBarView);
                        var that = this;
                        waitUntilElementVisible({
                            $el: that.tableView.$el,
                            success: function () {
                                that.tableView.triggerMethod('dom:refresh');
                            }
                        });
                    });
                },

                _handleFacetBarVisible: function () {
                    this.facetBarView.$el.find("#xecmpf-eac-facet-bar .csui-facet-list-bar .csui-facet-item:last a").focus();
                },

                _handleFacetBarHidden: function () { },

                _setFacetPanelView: function () {
                    this.facetView = new FacetPanelView({
                        collection: this.facetFilters,
                        blockingLocal: true
                    });
                    this.listenTo(this.facetView, {
                        'remove:filter': this._removeFacetFilter,
                        'remove:all': this._removeAll,
                        'apply:filter': this._addToFacetFilter,
                        'apply:all': this._setFacetFilter
                    })
                },

                _filterArray: function (facetValues) {
                    return facetValues.reduce(function (memo, facetValue) {
                        var temp = facetValue.split(':');
                        memo[temp[0]] = temp[1].split("|");
                        return memo;
                    }, {});
                },

                _addToFacetFilter: function (filter) {
                    this.facetFilters.addFilter(filter);
                    var facetValues = this.facetFilters.getFilterQueryValue();
                    this.collection.setFilter(this._filterArray(facetValues));
                },

                _setFacetFilter: function (filter) {
                    this.facetFilters.setFilter(filter);
                    var facetValues = this.facetFilters.getFilterQueryValue();
                    this.collection.setFilter(this._filterArray(facetValues));
                },

                _removeFacetFilter: function (filter) {
                    this.facetFilters.removeFilter(filter);
                    var facetValues = this.facetFilters.getFilterQueryValue();
                    if (facetValues.length === 0) {
                        this._removeAll();
                    } else {
                        this.collection.setFilter(this._filterArray(facetValues));
                    }
                },

                _removeAll: function () {
                    this.facetFilters.clearFilter();
                    this.collection.reset(this.collection.allModels);
                },

                _toolbarActionTriggered: function (toolbarActionContext) {
                    switch (toolbarActionContext.commandSignature) {
                        case 'EACBack':
                            break;
                        case 'Filter':
                            this._completeFilterCommand();
                            break;
                        case 'EACRefresh':
                            var parentView = this;
                            var node = parentView.options.context.getModel(NodeFactory, parentView.options);
                            parentView.options.collection = new EACEventActionPlans([], _.extend({
                                connector: node.connector,
                                node: node
                            }));
                            parentView.options.collection.fetch();
                            this.listenTo(parentView.options.collection, 'sync', function () {
                                parentView.tableView.collection = parentView.options.collection;
                                parentView.tableView.triggerMethod('dom:refresh');
                                parentView._removeAll();
                            });
                            break;
                    }
                },

                _transitionEnd: _.once(
                        function () {
                            var transitions = {
                                transition: 'transitionend',
                                WebkitTransition: 'webkitTransitionEnd',
                                MozTransition: 'transitionend',
                                OTransition: 'oTransitionEnd otransitionend'
                            },
                                    element = document.createElement('div'),
                                    transition;
                            for (transition in transitions) {
                                if (typeof element.style[transition] !== 'undefined') {
                                    return transitions[transition];
                                }
                            }
                        }
                ),

                _completeFilterCommand: function () {
                    var that = this;
                    this.showFilter = !this.showFilter;
                    if (this.showFilter) {
                        this._ensureFacetPanelViewDisplayed();
                        this.ui.facetView.removeClass('csui-facetview-visibility');
                        this.ui.facetView.one(this._transitionEnd(), function () {
                            that.tableView.triggerMethod('dom:refresh');
                        }).removeClass('csui-facetview-hidden');
                    } else {
                        this.ui.facetView.one(this._transitionEnd(), function () {
                            that.tableView.triggerMethod('dom:refresh');
                            that.ui.facetView.hasClass('csui-facetview-hidden') &&
                                    that.ui.facetView.addClass('csui-facetview-visibility');
                            that._removeFacetPanelView();
                        }).addClass('csui-facetview-hidden');
                    }
                },

                _ensureFacetPanelViewDisplayed: function () {
                    if (this.facetView === undefined) {
                        this._setFacetPanelView();
                        this.facetRegion.show(this.facetView);
                    }
                },

                _removeFacetPanelView: function () {
                    this.facetRegion.empty();
                    this.facetView = undefined;
                }
            });

            function waitUntilElementVisible(options) {
                if (options.$el.is(':visible')) {

                    options.success();
                    return;
                }
                options.count || (options.count = 'noLimit');
                options.interval || (options.interval = 200);
                setTimeout(function () {
                    if (options.count === 0) {
                        if (options.error !== undefined) {
                            options.error();
                        }
                    } else {
                        if (typeof options.count === 'number') {
                            options.count--;
                        }
                        waitUntilElementVisible(options);
                    }
                }, options.interval);
            }

            return EACView;
        });


/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/header/impl/displayUrl/impl/displayUrlItem',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "  <a class=\"xecmpf-displayUrl-icon conws-quick_link "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.displayUrlError : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop})) != null ? stack1 : "")
    + "\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.displayUrlTooltip || (depth0 != null ? depth0.displayUrlTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"displayUrlTooltip","hash":{}}) : helper)))
    + "\"\r\n     aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.ariaLabelBusApplText || (depth0 != null ? depth0.ariaLabelBusApplText : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"ariaLabelBusApplText","hash":{}}) : helper)))
    + "\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.displayUrlError : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(6, data, 0)})) != null ? stack1 : "")
    + "></a>\r\n";
},"2":function(depth0,helpers,partials,data) {
    return "\r\n    xecmpf-displayUrl-error ";
},"4":function(depth0,helpers,partials,data) {
    return "  href=\"#\"  ";
},"6":function(depth0,helpers,partials,data) {
    var helper;

  return "\r\n     href=\""
    + this.escapeExpression(((helper = (helper = helpers.displayUrl || (depth0 != null ? depth0.displayUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"displayUrl","hash":{}}) : helper)))
    + "\" target=\"_blank\"";
},"8":function(depth0,helpers,partials,data) {
    var helper;

  return "  <button class=\"xecmpf-displayUrl-icon conws-quick_link binf-btn binf-btn-default\"\r\n          aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.ariaLabelBusApplText || (depth0 != null ? depth0.ariaLabelBusApplText : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"ariaLabelBusApplText","hash":{}}) : helper)))
    + "\"></button>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.displayUrl : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(8, data, 0)})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_header_impl_displayUrl_impl_displayUrlItem', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
csui.define('hbs!xecmpf/widgets/header/impl/displayUrl/impl/displayUrl',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "  <div id=\"displayUrl-check\"></div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.bDisplayUrl : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop})) != null ? stack1 : "");
}});
Handlebars.registerPartial('xecmpf_widgets_header_impl_displayUrl_impl_displayUrl', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/widgets/header/impl/displayUrl/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});


csui.define('xecmpf/widgets/header/impl/displayUrl/impl/nls/root/lang',{
  displayUrlTooltip: "Business application",
  displayUrlTitle: "Business applications",
  ariaLabelBusApplText: "Go to business application"
});



csui.define('css!xecmpf/widgets/header/impl/displayUrl/impl/displayUrl',[],function(){});
csui.define('xecmpf/widgets/header/impl/displayUrl/displayUrl.view',[
  'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/dialogs/modal.alert/modal.alert',
  'xecmpf/widgets/header/impl/previewpane/previewpane.view',
  'hbs!xecmpf/widgets/header/impl/displayUrl/impl/displayUrlItem',
  'hbs!xecmpf/widgets/header/impl/displayUrl/impl/displayUrl',
  'i18n!xecmpf/widgets/header/impl/displayUrl/impl/nls/lang',
  'css!xecmpf/widgets/header/impl/displayUrl/impl/displayUrl'
], function (_, $, Backbone, Marionette, ModalAlert, PreviewPaneView, itemTemplate,
    layoutTemplate, lang) {

  var DisplayUrlItemView = Marionette.ItemView.extend({

    className: 'xecmpf-displayUrl-item',

    constructor: function DisplayUrlItemView(options) {
      options || (options = {});
      this.options = options;
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
      this.listenTo(this.options.collection, 'change', this.render);

      if (this.options && this.options.preview &&
          // only in case of more than 1 display url:
          options.collection.length > 1
      ) {
        this.previewPane = new PreviewPaneView({
          parent: this,
          config: {debug: true},
          collection: options.collection,
          headerTitle: lang.displayUrlTitle,
          headerColor: options.headerColor
        });
      }
    },

    events: {
      "click .xecmpf-displayUrl-error": 'showError'
    },

    template: itemTemplate,

    templateHelpers: function () {
      // displayUrl: the display Url if bus. wksp. is assigned to exactly 1 bus. appl.
      var displayUrl = (this.options.collection.length === 1) ?
                       this.options.collection.models[0].get('displayUrl') : false;

      var displayUrlError = (this.options.collection.length === 1) ?
                            this.options.collection.models[0].get('displayUrlError') : "";

      // in case wksp. is assigned to exactly 1 bus. appl.:
      // aria label: lang.ariaLabelBusApplText + external system name
      // in case wksp. is assigned to several bus. appls.:
      // aria label: lang.ariaLabelBusApplText
      var ariaLabelBusApplText = lang.ariaLabelBusApplText + (displayUrl ?
                                 ' ' +
                                 this.options.collection.models[0].get('external_system_name') :
                                                              '');

      // Tooltip only useful exactly 1 bus. appl.
      var displayUrlTooltip = displayUrl ? lang.displayUrlTooltip : '';

      return {
        ariaLabelBusApplText: ariaLabelBusApplText,
        displayUrlTooltip: displayUrlTooltip,
        displayUrl: displayUrl,
        displayUrlError: displayUrlError
      }
    },

    onBeforeDestroy: function () {
      if (this.previewPane) {
        this.previewPane.destroy();
        delete this.previewPane;
      }
    },

    showError: function () {
      ModalAlert.showError(this.options.collection.models[0].get('displayUrlError'));
    }

  });

  var DisplayUrlView = Marionette.LayoutView.extend({

    className: 'xecmpf-displayUrlcheck',

    constructor: function DisplayUrlView(options) {
      options || (options = {});
      this.model = options.model;
      this.options.headerColor = 'xecmpf-displayUrl-header-background';
      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
    },

    template: layoutTemplate,

    templateHelpers: function () {
      // bDisplayUrl: whether the link should be displayed at all:
      var bDisplayUrl = (this.model.display_urls && (this.model.display_urls.length > 0)) ?
                        true : false;
      return {
        bDisplayUrl: bDisplayUrl
      }
    },

    regions: {
      displayUrlRegion: '#displayUrl-check'
    },

    onRender: function () {
      var collection;
      if (this.model.display_urls && this.model.display_urls.length >= 1) {
        var displayUrlArray = _.map(this.model.display_urls, function (item) {
          var name = item.business_object_type_name + ' (' + item.external_system_name +
                     ')';
          return {
            name: name,
            displayUrl: item.displayUrl,
            external_system_name: item.external_system_name,
            displayUrlError: item.errMsg
          }
        });
        collection = new Backbone.Collection();
        collection.add(displayUrlArray);

        this.displayUrlRegion.show(new DisplayUrlItemView({
          collection: collection,
          preview: {debug: true},
          headerColor: this.options.headerColor
        }));
      }
    }
  });

  return DisplayUrlView;

});

// Lists explicit locale mappings and fallbacks

csui.define('xecmpf/widgets/header/impl/nls/header.lang',{
    // Always load the root bundle for the default locale (en-us)
    "root": true,
    // Do not load English locale bundle provided by the root bundle
    "en-us": false,
    "en": false
  });
// Defines localizable strings in the default language (English)

csui.define('xecmpf/widgets/header/impl/nls/root/header.lang',{
    noMetadataMessage: 'No metadata to display.'
  });

csui.define('xecmpf/widgets/header/impl/metadata.view',[
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/marionette',
  'csui/lib/handlebars',
  'csui/controls/list/emptylist.view',
  'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'conws/models/workspacecontext/workspacecontext.factory',
  'conws/models/selectedmetadataform/selectedmetadataform.factory',
  'conws/controls/selectedmetadataform/selectedmetadataform.view',
  'i18n!xecmpf/widgets/header/impl/nls/header.lang'
], function (_, $, Marionette, Handlebars,
    EmptyListView, PerfectScrollingBehavior,
    WorkspaceContextFactory, SelectedMetadataFormFactory, SelectedMetadataFormView, lang) {

  var MetadataView = Marionette.ItemView.extend({
    className: 'xecmpf-form-metadata',

    attributes: {
      style: 'height: 100%'
    },

    template: false,

    constructor: function MetadataView(options) {
      options || (options = {});
      if (!options.context) {
        throw new Error('Context is missing in the constructor options');
      }

      // get workspace context
      if (!options.workspaceContext) {
        options.workspaceContext = options.context.getObject(WorkspaceContextFactory);
      }
      options.workspaceContext.setWorkspaceSpecific(SelectedMetadataFormFactory);

      // get model collection from the model factory
      options.model = options.workspaceContext.getObject(SelectedMetadataFormFactory, {
        metadataConfig: options.data,
        unique: true
      });

      this.noMetadataMessage = lang.noMetadataMessage;

      Marionette.ItemView.prototype.constructor.call(this, options);

      this.listenTo(options.model, 'change', this.render);
    },

    behaviors: {
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        contentParent: this.$el,
        suppressScrollX: true,
        scrollYMarginOffset: 15
      }
    },

    onRender: function () {
      this.formRegion = new Marionette.Region({el: this.$el});
      if (!_.isEmpty(this.model.attributes.data)) {
        // Code to remove the null values in the data
        var metadata = this.model.attributes.data;
        var colOptions = this.options.data.colOptions;
        var fields = this.model.attributes.options.fields;
        _.each(_.keys(metadata), function (key) {
          if (metadata[key] === "null") {
            metadata = _.omit(metadata, key);
            fields[key].hidden = true;
          }
        });
        this.model.attributes.data = metadata;
        this.model.attributes.options.fields = fields;

        this.formView = new SelectedMetadataFormView({
          model: this.model,
          context: this.options.context,
          layoutMode: !!colOptions && colOptions === 'singleCol' ? colOptions : 'doubleCol'
        });
        this.formRegion.show(this.formView);
      } else {
        this.formView = new EmptyListView({text: this.noMetadataMessage});
        this.formRegion.show(this.formView);
      }
      this.listenTo(this.formView, 'render:form', function () {
        this.triggerMethod("dom:refresh");
      });
    }
  });

  return MetadataView;
});


csui.define('css!xecmpf/widgets/header/impl/header',[],function(){});
// Workspace Header View
csui.define('xecmpf/widgets/header/header.view',['module',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/marionette',
  'csui/lib/handlebars',
  'conws/widgets/header/header.view',
  'conws/models/selectedmetadataform/selectedmetadataform.factory',
  'xecmpf/widgets/header/impl/completenesscheck/completenesscheck.view',
  'xecmpf/widgets/header/impl/displayUrl/displayUrl.view',
  'esoc/widgets/activityfeedwidget/activityfeedfactory',
  'esoc/widgets/activityfeedwidget/activityfeedcontent',
  'xecmpf/widgets/header/impl/metadata.view',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'xecmpf/widgets/header/headertoolbaritems',
  'css!xecmpf/widgets/header/impl/header'
], function (module, _, $, Marionette, Handlebars,
    ConwsHeaderView, MetadataFactory,
    CompletenessCheckView, DisplayUrlView,
    ActivityFeedFactory, ActivityFeedContent,
    MetadataView, TabKeyBehavior, headertoolbaritems) {

  // activity feed widget
  var constants = {'activityfeedwidget': 'esoc/widgets/activityfeedwidget'};
  var moduleConfig = module.config();
  var HeaderView = ConwsHeaderView.extend({

    id: 'xecmpf-header',

    constructor: function HeaderView(options) {
      options || (options = {});
      options.data || (options.data = {});
      options.data.widget || (options.data.widget = {});
      options.data.widget.type || (options.data.widget.type = 'metadata');
      options.hideToolbar = !!moduleConfig.hideToolbar;
      options.hideActivityFeed = !!moduleConfig.hideActivityFeed;
      options.hideMetadata = !!moduleConfig.hideMetadata || !(options.data.metadataSettings &&
                                                              options.data.metadataSettings.metadata &&
                                                              !options.data.metadataSettings.hideMetadata);
      options.toolbarBlacklist = [];
      options.extensionToolbarBlacklist = [];

      var toolbarBlacklist = moduleConfig.toolbarBlacklist;
      if (Array.isArray(toolbarBlacklist) && toolbarBlacklist.length > 0) {
        options.toolbarBlacklist = toolbarBlacklist;
      }
      var extensionToolbarBlacklist = moduleConfig.extensionToolbarBlacklist;
      if (Array.isArray(extensionToolbarBlacklist) && extensionToolbarBlacklist.length > 0) {
        options.extensionToolbarBlacklist = extensionToolbarBlacklist;
      }

      if (options.data && options.data.favoriteSettings &&
          options.data.favoriteSettings.hideFavorite) {
        if (!options.toolbarBlacklist['Favorite2']) {
          options.toolbarBlacklist.push('Favorite2');
        }
        if (!options.extensionToolbarBlacklist['Favorite2']) {
          options.extensionToolbarBlacklist.push('Favorite2');
        }
      }

      if (!options.extensionToolbarBlacklist['CompletenessCheck']) {
        options.extensionToolbarBlacklist.push('CompletenessCheck');
      }
      var cCConfig           = options.data.completenessCheckSettings,
          cCViewOptions      = {
            context: options.context,
            workspaceContext: options.workspaceContext,
            hideMissingDocsCheck: cCConfig && cCConfig.hideMissingDocsCheck,
            hideOutdatedDocsCheck: cCConfig && cCConfig.hideOutdatedDocsCheck,
            hideInProcessDocsCheck: cCConfig && cCConfig.hideInProcessDocsCheck
          },
          toolItemCollection = headertoolbaritems.rightToolbar.collection;
      if (toolItemCollection && toolItemCollection.length > 0) {
        var completenessToolModel = toolItemCollection.findWhere({signature: "CompletenessCheck"});
        completenessToolModel.set({commandData: {viewOptions: cCViewOptions}})
      }
      options.cCViewOptions = cCViewOptions;
      options.headertoolbaritems = headertoolbaritems;
      options.headerExtensionToolbaritems = headertoolbaritems;

      ConwsHeaderView.prototype.constructor.call(this, options);
      if (options.workspaceContext) {
        options.workspaceContext.setWorkspaceSpecific(MetadataFactory);
        options.workspaceContext.setWorkspaceSpecific(ActivityFeedFactory);
      }
    },

    // prevent tabbable behaviour (=deprecated) from conws header widget
    behaviors: {
      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },

    initialize: function (options) {
      options || (options = {});
      if (options.data) {

        var headerwidgetConfigValue = options.data.headerwidget ? (options.data.headerwidget.type ?
                                                                   options.data.headerwidget.type :
                                                                   "metadata" ) : "metadata";
        this.headerwidgetConfigValue = headerwidgetConfigValue;

        if (headerwidgetConfigValue === 'metadata'
            && (options.data.widget.type === 'metadata') && !this.options.hideMetadata) {
          var mConfig = options.data.metadataSettings;
          var metadata = this._makeMetadataReadOnly(mConfig.metadata);
          var mViewOptions = {
            context: options.context,
            workspaceContext: options.workspaceContext,
            data: {
              hideEmptyFields: mConfig.hideEmptyFields,
              metadata: metadata,
              readonly: true,
              colOptions: options.data.metadataSettings.metadataInColumns
            }
          };
          this.metadataView = new MetadataView(mViewOptions);
        }
        if (this.headerwidgetConfigValue === 'activityfeed' && !this.options.hideActivityFeed) {
          options.data.widget.type = constants.activityfeedwidget;
          options.data.widget.options || (options.data.widget.options = {});
        }

        if (!moduleConfig.pageWidget) {
          var cCViewOptions = _.extend(options.cCViewOptions,
              {workspaceContext: options.workspaceContext});
          if (!cCViewOptions.hideMissingDocsCheck || !cCViewOptions.hideOutdatedDocsCheck ||
              !cCViewOptions.hideInProcessDocsCheck) {
            this.options.hasMetadataExtension = true;
            this.completenessCheckView = new CompletenessCheckView(cCViewOptions);
          }
        }

        var displayUrlViewOptions = {
          model: this.model,
          logging: {debug: false}
        };
        this.displayUrlView = new DisplayUrlView(displayUrlViewOptions);
      }
    },

    ui: {
      completenessCheckRegion: '.conws-header-metadata-extension',
      metadataRegion: '#conws-header-childview',
      displayUrlRegion: '.conws-header-child-displayUrl'
    },

    _makeMetadataReadOnly: function (arr) {
      var metadata = arr || [];
      metadata.forEach(function (obj) {
        obj['readOnly'] = true;
      });
      return metadata;
    },

    onRender: function (options) {
      ConwsHeaderView.prototype.onRender.apply(this, arguments);
      this.showChildViews();
    },

    showChildViews: function () {
      if (this.completenessCheckView) {
        this.completenessCheckRegion = new Marionette.Region({el: this.ui.completenessCheckRegion});
        this.completenessCheckRegion.show(this.completenessCheckView);

        if (this.descriptionView) {
          this.listenTo(this.descriptionView, "show:more:description", function () {
            this.toggleCompletenessCheckView(false);
          });
          this.listenTo(this.descriptionView, "show:less:description", function () {
            this.toggleCompletenessCheckView(true);
          });
        }
      }
      if (this.metadataView) {
        this.metadataRegion = new Marionette.Region({el: this.ui.metadataRegion});
        this.metadataRegion.show(this.metadataView);
      }
      if (this.displayUrlView) {
        this.displayUrlRegion = new Marionette.Region({el: this.ui.displayUrlRegion});
        this.displayUrlRegion.show(this.displayUrlView);
      }
    },

    toggleCompletenessCheckView: function (toggle) {
      if (toggle) {
        this.completenessCheckView.$el.removeClass("xecmpf-completenesscheck-hidden").addClass(
            "xecmpf-completenesscheck-shown");
      } else {
        this.completenessCheckView.$el.removeClass("xecmpf-completenesscheck-shown").addClass(
            "xecmpf-completenesscheck-hidden");
      }
    },

    hasChildView: function () {
      var isChildWidgetConfigured = (this.options.data && this.options.data.widget &&
                                     this.options.data.widget.type &&
                                     this.options.data.widget.type !== "none");
      if (this.headerwidgetConfigValue === 'activityfeed') {
        return !this.options.hideActivityFeed && isChildWidgetConfigured;
      } else if (this.headerwidgetConfigValue === 'metadata') {
        return !this.options.hideMetadata && isChildWidgetConfigured;
      }
    },

    onDomRefresh: function () {
      if (this.completenessCheckView) {
        this.toggleCompletenessCheckView(true);
      }

      if (!!this.descriptionView && this.descriptionView.ui.readMore.is(":hidden") &&
          this.descriptionView.ui.showLess.is(":visible")) {
        this.descriptionView.ui.showLess.click();
        this.currentlyFocusedElement().focus();
      }

      this.isTabable() ? this.currentlyFocusedElement().attr("tabindex", "0") :
      this.currentlyFocusedElement().attr("tabindex", "-1");

      // line clamping
      this._clampTexts();
    },

    onBeforeDestroy: function () {
      if (this.metadataView) {
        this.metadataView.destroy();
      }
      if (this.displayUrlView) {
        this.displayUrlView.destroy();
      }
    }
  });

  return HeaderView;
});

csui.define('xecmpf/widgets/scan/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/scan/impl/nls/root/lang',{
  title: 'Scan barcode',
  defaultTextForDesktop:'This widget is only supported for mobile UI.'
});


csui.define('xecmpf/widgets/scan/scan.content.view',['csui/lib/marionette','i18n!xecmpf/widgets/scan/impl/nls/lang'],function(Marionette,Lang){
  var ContentView = Marionette.ItemView.extend({
    constructor: function ContentView(options) {
      Marionette.ItemView.prototype.constructor.call(this, options);
    },
    render: function () {
      this.$el.text(Lang.defaultTextForDesktop);
      return this;
    }
  });
  return ContentView;
});
csui.define('xecmpf/widgets/scan/scan.view',['csui/lib/underscore',
      'csui/controls/tile/tile.view',
      'xecmpf/widgets/scan/scan.content.view',
      'i18n!xecmpf/widgets/scan/impl/nls/lang'],
    function (_, TileView, ScanContentView, Lang) {
      var ScanView = TileView.extend({
        constructor: function ScanView(options) {
          TileView.prototype.constructor.call(this, options);
        },
        contentView: ScanContentView,
        icon: 'title-recentlyaccessed',// TODO : change the icon
        title: Lang.title
      });
      return ScanView;
    });
 


csui.define('xecmpf/controls/savedquery.node.picker/impl/search.query.factory',['module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory'
], function (module, _, Backbone, ModelFactory) {

  var SearchQueryModel = Backbone.Model.extend({

    constructor: function SearchQueryModel(attributes, options) {
      SearchQueryModel.__super__.constructor.apply(this, arguments);
    },

    toJSON: function () {
      return SearchQueryModel.__super__.toJSON.apply(this, arguments);
    }

  });

  var SearchQueryModelFactory = ModelFactory.extend({

    propertyPrefix: 'xecmpfSearchQuery',

    constructor: function SearchQueryModelFactory(context, options) {
      ModelFactory.prototype.constructor.apply(this, arguments);

      var searchQuery = this.options.xecmpfSearchQuery || {};
      if (!(searchQuery instanceof Backbone.Model)) {
        var config = module.config();
        searchQuery = new SearchQueryModel(searchQuery.models, _.extend({},
            searchQuery.options, config.options));
      }
      this.property = searchQuery;
    }

  });

  return SearchQueryModelFactory;
});

csui.define('xecmpf/controls/savedquery.node.picker/impl/search.results.factory',['require', 'module', 'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/factory', 'csui/utils/contexts/factories/connector',
  'csui/models/widget/search.results/search.results.model',
  'csui/utils/commands',
  'csui/utils/base'
], function (require, module, _, Backbone, CollectionFactory, ConnectorFactory,
    SearchResultCollection, commands, base) {

  var SearchResultCollectionFactory = CollectionFactory.extend({

    propertyPrefix: 'xecmpfSearchResults',

    constructor: function SearchResultCollectionFactory(context, options) {
      CollectionFactory.prototype.constructor.apply(this, arguments);

      var searchResults = this.options.xecmpfSearchResults || {};
      if (!(searchResults instanceof Backbone.Collection)) {
        var connector = context.getObject(ConnectorFactory, options),
            query     = options.xecmpfSearchResults.query,
            config    = module.config();
        searchResults = new SearchResultCollection(searchResults.models, _.extend({
          connector: connector,
          query: query,
          // Ask the server to check for permitted actions V2
          commands: commands.getAllSignatures()
        }, searchResults.options, config.options, {
          autofetch: true,
          autoreset: true
        }));
      }
      this.property = searchResults;
    },

    isFetchable: function () {
      return this.property.isFetchable();
    },

    fetch: function (options) {
      this.property.fetch({
        success: _.bind(this._onSearchResultsFetched, this, options),
        error: _.bind(this._onSearchResultsFailed, this, options)
      });
    },

    _onSearchResultsFetched: function (options) {
      //nothing to-do for now upon success.
      return true;
    },

    _onSearchResultsFailed: function (model, request, message) {
      var error = new base.RequestErrorMessage(message);
      csui.require(['csui/dialogs/modal.alert/modal.alert'], function (ModalAlert) {
        ModalAlert.showError(error.toString());
      });
    }

  });

  return SearchResultCollectionFactory;
});


/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/savedquery.node.picker/impl/savedquery.form',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"xecmpf-sq-select-container\"></div>\r\n<div class=\"xecmpf-custom-search-container\"></div>\r\n";
}});
Handlebars.registerPartial('xecmpf_controls_savedquery.node.picker_impl_savedquery.form', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/controls/savedquery.node.picker/impl/nls/lang',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/controls/savedquery.node.picker/impl/nls/root/lang',{
  selectQuery: 'Select Search Query'
});



csui.define('css!xecmpf/controls/savedquery.node.picker/impl/savedquery.form',[],function(){});


csui.define('xecmpf/controls/savedquery.node.picker/impl/savedquery.form.view',['module', 'require', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'csui/models/node/node.model',
  'csui/utils/contexts/factories/connector',
  'csui/utils/contexts/factories/children2',
  'csui/behaviors/keyboard.navigation/tabables.behavior',
  'xecmpf/controls/savedquery.node.picker/impl/search.query.factory',
  'csui/models/form', 'csui/controls/form/form.view',
  'csui/widgets/search.custom/search.custom.view',
  'hbs!xecmpf/controls/savedquery.node.picker/impl/savedquery.form',
  'i18n!xecmpf/controls/savedquery.node.picker/impl/nls/lang',
  'css!xecmpf/controls/savedquery.node.picker/impl/savedquery.form'
], function (module, require, _, $, Marionette, NodeModel, ConnectorFactory,
    Children2CollectionFactory, TabablesBehavior, SearchQueryModelFactory,
    FormModel, FormView, CustomSearchView,
    template, lang) {

  var config = _.extend({
    csSubTypes: {
      queryVolume: 860,
      query: 258
    }
  }, module.config());

  var SavedQueryFormView = Marionette.LayoutView.extend({

    className: 'xecmpf-savedquery-form',

    template: template,

    regions: {
      querySelectRegion: '.xecmpf-sq-select-container',
      customSearchRegion: '.xecmpf-custom-search-container'
    },

    constructor: function SavedQueryFormView(options) {
      options || (options = {});
      options.query || (options.query = options.context.getModel(SearchQueryModelFactory));

      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
    },

    initialize: function (options) {
      this.query = options.query;
    },

    setQuerySelectField: function () {
      var deferred = $.Deferred();
      this._getQueryCollection()
          .then(function (searchQueryCollection) {
            var map = {};
            searchQueryCollection.each(function (node) {
              // map key is `name` to keep the list sorted by name
              map[node.get('name')] = node.get('id');
            });

            this.query.set('query_id', map[_.keys(map)[0]] || '', {
              silent: true
            });

            var that = this;
            this.querySelectForm = new FormView({
              mode: 'create',
              model: new FormModel({
                data: {
                  searchQueryId: this.query.get('query_id')
                },
                schema: {
                  properties: {
                    searchQueryId: {
                      enum: _.values(map)
                    }
                  }
                },
                options: {
                  fields: {
                    searchQueryId: {
                      label: lang.selectQuery,
                      name: 'searchQueryId',
                      type: 'select',
                      optionLabels: _.keys(map),
                      removeDefaultNone: true,
                      onFieldChange: function () {
                        that.onChangeSavedQuerySelectField(this.getValue());
                      }
                    }
                  }
                }
              })
            });
            deferred.resolve();
          }.bind(this), deferred.reject);

      return deferred;
    },

    onChangeSavedQuerySelectField: function (queryId) {
      this.query.clear({
        silent: true
      }).set('query_id', queryId, {
        silent: true
      });

      this.setCustomSearchView()
          .then(function () {
            this.showChildView('customSearchRegion', this.customSearchView);
          }.bind(this), function (err) {
            console.error('Unable to set custom search form view.');
          });
    },

    _getQueryCollection: function () {
      var searchQueryCollection = this.options.context.getCollection(Children2CollectionFactory, {
        options: {
          // use this node model as parent node to get the children
          node: new NodeModel({
            id: config.queryVolumeId,
            type: config.csSubTypes.queryVolume
          }, {
            // node model collection needs connector
            connector: this.options.context.getObject(ConnectorFactory)
          }),
          filter: {
            type: config.csSubTypes.query // fetch only first level queries not query folders
          }
        },
        // specify id-attribute to give the collection factory in the context a unique key
        attributes: {
          id: config.queryVolumeId
        }
      });

      var deferred = $.Deferred();

      searchQueryCollection
          .ensureFetched()
          .then(function () {
            deferred.resolve(searchQueryCollection);
          }, deferred.reject);

      return deferred;
    },

    setCustomSearchView: function () {
      var deferred = $.Deferred();
      csui.require(['csui/widgets/search.custom/impl/search.object.view'], function (SearchObjectView) {
        this.customSearchView && this.customSearchView.destroy();
        var queryId = this.query.get('query_id');
        this.customSearchView = queryId ?
                                new SearchObjectView({
                                  context: this.options.context,
                                  query: this.options.query,
                                  savedSearchQueryId: queryId
                                }) : new Marionette.View();
        this.customSearchView.model && this.customSearchView.model.ensureFetched();
        deferred.resolve();
      }.bind(this), deferred.reject);
      return deferred;
    },

    onRender: function () {
      this.setQuerySelectField()
          .then(function () {
            this.showChildView('querySelectRegion', this.querySelectForm);
            this.setCustomSearchView()
                .then(function () {
                  this.showChildView('customSearchRegion', this.customSearchView);
                }.bind(this), function (err) {
                  console.error('Unable to set custom search form view.');
                });
          }.bind(this), function (err) {
            console.error('Unable to set saved queries select field.');
          });
    },

    onBeforeDestroy: function () {
      this.customSearchView && this.customSearchView.destroy();
    }

  });

  return SavedQueryFormView;
});

csui.define('css!xecmpf/controls/savedquery.node.picker/impl/savedquery.node.picker',[],function(){});
csui.define('xecmpf/controls/savedquery.node.picker/savedquery.node.picker.view',['csui/lib/underscore', 'csui/lib/jquery',
  'csui/lib/backbone', 'csui/lib/marionette', 'csui/lib/handlebars',
  'xecmpf/controls/savedquery.node.picker/impl/search.query.factory',
  'xecmpf/controls/savedquery.node.picker/impl/search.results.factory',
  'xecmpf/controls/savedquery.node.picker/impl/savedquery.form.view',
  'csui/widgets/search.results/search.results.view',
  'css!xecmpf/controls/savedquery.node.picker/impl/savedquery.node.picker'
], function (_, $, Backbone, Marionette, Handlebars,
  SearchQueryModelFactory, SearchResultsCollectionFactory,
  SearchFormView, SearchResultsView) {

  var SavedQueryNodePickerView = Marionette.Object.extend({

    constructor: function SavedQueryNodePickerView(options) {
      options || (options = {});
      options.query || (options.query = options.context.getModel(SearchQueryModelFactory));
      options.collection ||
        (options.collection = options.context.getCollection(SearchResultsCollectionFactory, _.extend({
          // to get a new collection object every time
          unique: true,
          temporary: true,
          detached: true
        }, options)));
      Marionette.Object.prototype.constructor.apply(this, arguments);
    },

    initialize: function (options) {
      this.searchFormView = new SearchFormView({
        context: options.context,
        query: options.query
      });

      this.searchResultsView = new SearchResultsView({
        context: options.context,
        query: options.query,
        collection: options.collection,
        customSearchView: this.searchFormView,
        toolbarItems: this.options.toolbarItems,
        enableBackButton: this.options.enableBackButton,
        titleView: new Marionette.ItemView({
          tagName: 'h2',
          template: Handlebars.compile('<span>{{title}}</span>')({
            title: this.options.title
          })
        })
      });

      if (!this.options.toolbarItems.inlineToolbar) {
        this.searchResultsView.resultsView.lockedForOtherContols = true;
        this.searchResultsView.resultsView.$el.addClass('xecmpf-sq-np-no-inline-toolbar');
      }

      this.listenTo(this.searchResultsView, {
        'set:picker:result': function (result) {
          this._result = result;
        },
        'close go:back': function () {
          this.triggerMethod('close');
        }
      });
    },

    onBeforeDestroy: function () {
      this.options.query.clear();
      this.searchFormView.destroy();
      this.searchResultsView.destroy();
    },

    show: function () {
      this._deferred = $.Deferred();
      var originatingView = this.options.originatingView,
        containerEl = this.options.containerEl;

      if (originatingView instanceof Backbone.View) {
        var $pickerEl = $('<div/>', {
            class: 'xecmpf-savedquery-node-picker'
          }),
          $originatingView = (_.isString(containerEl) && $(containerEl + '>*')) ||
          originatingView.$el;

        $originatingView.parent().append($pickerEl);

        this.searchResultsView.render();
        Marionette.triggerMethodOn(this.searchResultsView, 'before:show');
        $pickerEl.append(this.searchResultsView.el);

        var that = this;
        $pickerEl.show('blind', {
          direction: 'right',
          complete: function () {
            $originatingView.hide();
            originatingView.isDisplayed = false;
            // SAPRM-12354 BA widget: Upon pressing the add button, Business Attachment form the search form appears blank
            // - if Side panel is hidden, toggle it.  
            if (that.searchResultsView.ui.searchSidePanel.hasClass('csui-is-hidden')) {
              that.searchResultsView.headerView.triggerMethod('toggle:filter', that.searchResultsView);
            }
            Marionette.triggerMethodOn(that.searchResultsView, 'show');
          }
        }, 100);

        this.listenTo(this, 'close', function () {
          $originatingView.show();
          $originatingView.promise()
            .done(function () {
              originatingView.isDisplayed = true;
              $pickerEl.hide('blind', {
                direction: 'right',
                complete: function () {
                  if (that._result) {
                    that._deferred.resolve(that._result);
                  } else if (that._deferred.state() === 'pending') {
                    that._deferred.reject({
                      cancelled: true
                    });
                  }
                  that.destroy();
                  $pickerEl.remove();
                }
              }, 100);
            });
        });
        return this._deferred;
      }
      return this._deferred.reject().promise();
    }
  });

  return SavedQueryNodePickerView;
});

/* START_TEMPLATE */
csui.define('hbs!xecmpf/controls/search.textbox/impl/search.textbox',['module','hbs','csui/lib/handlebars'], function( module, hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"xecmpf-search-bar\" role=\"dialog\">\r\n  <div class=\"xecmpf-search-bar-content\">  \r\n      <span class=\"xecmpf-search-icon-static\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.searchTooltip || (depth0 != null ? depth0.searchTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"searchTooltip","hash":{}}) : helper)))
    + "\"\r\n          aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.searchTooltip || (depth0 != null ? depth0.searchTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"searchTooltip","hash":{}}) : helper)))
    + "\"></span>  \r\n    <div class=\"xecmpf-search-input-container\">\r\n      <input type=\"text\" class=\"xecmpf-input\" placeholder=\""
    + this.escapeExpression(((helper = (helper = helpers.searchFromHere || (depth0 != null ? depth0.searchFromHere : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"searchFromHere","hash":{}}) : helper)))
    + "\"\r\n             title=\""
    + this.escapeExpression(((helper = (helper = helpers.searchFromHere || (depth0 != null ? depth0.searchFromHere : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"searchFromHere","hash":{}}) : helper)))
    + "\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.searchFromHere || (depth0 != null ? depth0.searchFromHere : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"searchFromHere","hash":{}}) : helper)))
    + "\">\r\n    </div>\r\n    <a href=\"#\" class=\"xecmpf-clearer formfield_clear\" title=\""
    + this.escapeExpression(((helper = (helper = helpers.clearTextTooltip || (depth0 != null ? depth0.clearTextTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"clearTextTooltip","hash":{}}) : helper)))
    + "\"\r\n          aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.clearTextTooltip || (depth0 != null ? depth0.clearTextTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"clearTextTooltip","hash":{}}) : helper)))
    + "\"></a>\r\n  </div>\r\n</div>\r\n<div role=\"button\" class=\"xempf-search-close\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.closeSearchTooltip || (depth0 != null ? depth0.closeSearchTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"closeSearchTooltip","hash":{}}) : helper)))
    + "\">\r\n  <a href=\"javascript:void(0);\" class=\"icon xecmpf-icon-close xempf-search-hide csui-acc-focusable\"\r\n    title=\""
    + this.escapeExpression(((helper = (helper = helpers.closeSearchTooltip || (depth0 != null ? depth0.closeSearchTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"closeSearchTooltip","hash":{}}) : helper)))
    + "\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.closeSearchTooltip || (depth0 != null ? depth0.closeSearchTooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"closeSearchTooltip","hash":{}}) : helper)))
    + "\" aria-expanded=\"false\"></a>\r\n</div>";
}});
Handlebars.registerPartial('xecmpf_controls_search.textbox_impl_search.textbox', t);
return t;
});
/* END_TEMPLATE */
;
csui.define('xecmpf/controls/search.textbox/impl/nls/lang',{
    // Always load the root bundle for the default locale (en-us)
    "root": true,
    // Do not load English locale bundle provided by the root bundle
    "en-us": false,
    "en": false
  });
csui.define('xecmpf/controls/search.textbox/impl/nls/root/lang',{
    searchFromHere: 'Search from here',
    closeSearchTooltip: 'Clear all text and hide search',
    clearTextTooltip: 'Clear all text in this field',
    search: 'search'
});
  


csui.define('css!xecmpf/controls/search.textbox/impl/search.textbox',[],function(){});
csui.define('xecmpf/controls/search.textbox/search.textbox.view',[
    'module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'csui/utils/contexts/factories/search.query.factory',
    'hbs!xecmpf/controls/search.textbox/impl/search.textbox',
    'i18n!xecmpf/controls/search.textbox/impl/nls/lang',
    'i18n', 'css!xecmpf/controls/search.textbox/impl/search.textbox'
],function(module, _, $, Marionette, SearchQueryModelFactory, 
    template, lang, i18n) {
    "use strict";
    
    var config = _.defaults({}, module.config(), {
        inputValue: '',
        nodeId: '',
        nodeName: ''
    });

    var SearchTextBoxView = Marionette.ItemView.extend({
        className: 'xecmpf-search-text-box',
        template: template,
        
        ui: {
            input: '.xecmpf-input',
            clearer: '.xecmpf-clearer',
            closeSearchBtn: '.xempf-search-hide'
        },

        events: {
			'keyup @ui.input': 'inputTyped',
			'keydown @ui.input': 'inputTyped',
            'paste @ui.input': 'inputChanged',
            'change @ui.input': 'inputChanged',
            'click @ui.clearer': 'clearerClicked',
            'keydown @ui.clearer': 'keyDownOnClear',
            'click @ui.closeSearchBtn': 'closeSearchButtonClicked',
            'keydown @ui.closeSearchBtn': 'KeyDownOnCloseSearchBtn'
        },

        templateHelpers: function () {
            return {
                searchFromHere : lang.searchFromHere,
                clearTextTooltip: lang.clearTextTooltip,
                closeSearchTooltip: lang.closeSearchTooltip,
                searchTooltip: lang.search
            }
        },

        constructor: function SearchTextBoxView(options) {
            options || (options = {});
            options.data = _.defaults({}, options.data, config);
            this.direction = i18n.settings.rtl ? 'left' : 'right';

            var context = options.context;
            if (!options.model) {
                options.model = context.getModel(SearchQueryModelFactory);
            }
            Marionette.ItemView.prototype.constructor.apply(this, arguments);
        },

        onRender: function() {
            var value = this.options.data.inputValue || this.model.get('where');
            if (value) {
                this._setInputValue(value);
            }
        },

        inputTyped: function(event) {
            var value = this.ui.input.val().trim();
            if (event.which === 32) {
                event.stopPropagation();
            } else if (event.which === 13) {
                event.preventDefault();
                event.stopPropagation();
                this._setInputValue(value);
                if (!!value) {
                this.searchIconClicked(event);
                }
                if (this.previousValue !== value) {
                this.previousValue = value;
                }
            } else {
                this.inputChanged(event);
            }
		},
		
        inputChanged: function(event) {
            var value = this.ui.input.val();
            this.ui.clearer.toggle(!!value.length);
        },

        clearerClicked: function(event) {
            event.preventDefault();
            event.stopPropagation();

            this._setInputValue('');
            this.ui.input.focus();            
        },

        keyDownOnClear: function (event) {
            if (event.keyCode === 13) {
                this.clearerClicked(event);
            }
        },

        searchIconClicked: function(event) {
            var value = this.ui.input.val().trim();
            if (!!value) {
                this._setInputValue(value);
                var searchOption = this.options.data.nodeId;

                if (!!value) {
                this._setSearchQuery(value, this.options.sliceString, searchOption, event);
                this._updateInput();
                this.options.data.searchFromHere = true;
                }

                this._triggerSearchResults();
            }    
        },

        _updateInput: function() {
            if (this._isRendered) {
                var value = this.model.get('where') || '';
                this._setInputValue(value);
              }
        },

        _setSearchQuery: function(value, sliceString, searchOption, event) {
            this.model.clear({silent: true});
            var params = {};
            if (!!sliceString) {
                params['slice'] = sliceString;
            }
            if (!!searchOption) {
                params['location_id1'] = searchOption;
            }
            if (value) {
                params['where'] = value;
            }
            this.model.set(params);
        },

        _setInputValue: function(value) {
            this.ui.input.val(value);
            this.ui.clearer.toggle(!!value.length);
        },

        closeSearchButtonClicked: function (event) {
            this.trigger("hide:searchbar");
        },

        KeyDownOnCloseSearchBtn: function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
		        event.stopPropagation();
                this.trigger("hide:searchbar");
            }
        },

        _triggerSearchResults: function() {
            this.trigger("search:results");
        }

    });

    return SearchTextBoxView;

});
csui.define('xecmpf/controls/property.panels/reference/reference.panel.controller',['require',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/backbone',
  'csui/lib/marionette',
  'csui/utils/url',
  'csui/utils/log'
], function (require, _, $, Backbone, Marionette, Url, log
) {
  'use strict';

  function getReferencePanel(controller,mode,marker,attributes) {
    var deferred = $.Deferred();

    csui.require([
      'xecmpf/controls/bosearch/bosearch.model',
      'xecmpf/controls/bosearch/bosearch.dialog.controller',
      'xecmpf/controls/property.panels/reference/impl/workspace.reference.model',
      'xecmpf/controls/property.panels/reference/impl/reference.panel.model',
      'xecmpf/controls/property.panels/reference/impl/reference.panel.view'
    ], function (
        BoSearchModel,
        BoSearchDialogController,
        WorkspaceReferenceModel,
        ReferencePanelModel,
        ReferencePanelView
    ) {
      // we want to reuse the action context from a previous panel
      // so we attach it as listener to the context and request it when we need it again
      var eventobject = {};
      controller.options.context.trigger("request:actioncontext",eventobject);
      var actionContext = _.extend(eventobject.actionContext||{},{mode: mode});
      controller.options.context.once("request:actioncontext",function(eventobject) {
        eventobject.actionContext = actionContext;
      });

      // determine bo_type_id and bo_id, then display reference section
      if (!actionContext.workspaceReference) {
        actionContext.workspaceReference = new WorkspaceReferenceModel(attributes, {
          node: controller.options.model
        });
      } else {
        actionContext.workspaceReference.node = controller.options.model;
        actionContext.workspaceReference.set(attributes);
      }

      var bo_ref = actionContext.workspaceReference,
          fetch = bo_ref.get("id") ? bo_ref.fetch() : $.Deferred().resolve().promise();
      fetch.then(function(){
        if (marker) {
          // add css class, so we can set styles depending on whether reference tab exists or not.
          if(bo_ref.get("bo_type_id") != null) {
            marker.addClass("conws-reference-showing")
          } else {
            marker.removeClass("conws-reference-showing")
          }
        }

        if(bo_ref.get("bo_type_id") != null) {
          deferred.resolve([
            {
              model: new ReferencePanelModel(),
              contentView: ReferencePanelView,
              contentViewOptions: {
                actionContext: actionContext
              }
            }
          ]);
        } else {
          // there is no reference panel to display.
          deferred.resolve([]);
        }
      },function(error){
        deferred.reject(error);
      });
    }, function (error) {
      deferred.reject(error);
    });
    return deferred.promise();
  }

  var ReferencePanelController = Marionette.Controller.extend({

    constructor: function ReferencePanelController(options) {
      Marionette.Controller.prototype.constructor.apply(this, arguments);
    },

    getPropertyPanels: function (options) {
      // var node = this.options.model,
      //     connector = node.connector,
      //     nodeV1Url = Url.combine(connector.connection.url, 'nodes', node.get('id')),
      //     volumeV1Url = Url.combine(connector.connection.url, 'volumes/198');

      var isWorkspace;

       // first determine, whether a workspace is to be displayed
      isWorkspace = this.options && this.options.model && this.options.model.get("type")===848 &&
          // suppress reference panel for early workspaces => bus. obj. is set automatically
          !this.options.context.options.suppressReferencePanel;
		  

      // if a workspace is about to be displayed and general data is available
      if (isWorkspace) {

        log.debug("getPropertyPanels for connected workspace called") && console.log(log.last);
        var mode = "workspace_reference_edit",
            marker = $(".cs-perspective-panel .cs-properties-wrapper .metadata-content .cs-metadata"),
            boattributes = {
              id: this.options.model.get("id"),
              bo_id: undefined,
              bo_type_id: undefined,
              bo_type_name: undefined,
              ext_system_id: undefined,
              ext_system_name: undefined
        };

        return getReferencePanel(this,mode,marker,boattributes);
      }

      return null;
    },

    getPropertyPanelsForCreate: function (options) {

      var generalData, isWorkspace;

      // helper method to remove the add classifications button
      function disableClassificationsAdd(propertiesView,controller) {
        if (propertiesView) {
          controller.listenTo(propertiesView, 'before:render', function () {
            if (propertiesView.addPropertiesView) {
              if (!propertiesView.addPropertiesViewIsXecmRecreated) {
                propertiesView._createAddPropertiesView();
                propertiesView.addPropertiesViewIsXecmRecreated = true;
              }
            }
            if (propertiesView.addPropertiesView && propertiesView.addPropertiesView.collection) {
              if (!propertiesView.addPropertiesView.collection.hasXecmFilterModelsFunction) {
                var filtermodels = propertiesView.addPropertiesView.collection.filterModels;
                propertiesView.addPropertiesView.collection.filterModels = function(models) {
                  // replace the collection in the view with one that always filters classifications
                  // signatures "AddCategory", "AddRMClassification", "AddPropertiesClassifications"
                  arguments[0] = _.filter(models,function(cm){
                    var sig = cm.get("signature");
                    return sig==="AddRMClassification" || sig==="AddCategory";
                  });
                  return filtermodels.apply(this,arguments);
                };
                propertiesView.addPropertiesView.collection.hasXecmFilterModelsFunction = true;
                propertiesView.addPropertiesView.collection.refilter();
              }
            }
          });
          controller.listenTo(propertiesView, 'render', function () {
            if (propertiesView.addPropertiesViewIsXecmRecreated) {
              delete propertiesView.addPropertiesViewIsXecmRecreated;
            }
          });
        }
      }

      // first determine, whether a workspace is to be created
      if (options && options.forms && options.forms.models) {
        _.each(options.forms.models, function (form) {
          if (form.get('id') === 'general') {
            generalData = form.get('data');
            isWorkspace = generalData ? generalData.type===848 : false;
          }
        }, this);
      }
	  isWorkspace = isWorkspace &&
        // suppress reference panel for early workspaces => bus. obj. is set automatically
        !this.options.context.options.suppressReferencePanel;
		
      // if a workspace is about to be created
      if (isWorkspace) {

        log.debug("getPropertyPanelsForCreate for connected workspace called") && console.log(log.last);

        // check, if general data is available and then display reference section
        if (generalData) {

          var mode = "workspace_reference_create",
              forms = options && options.forms,
              formCollection = forms && forms.formCollection,
              bo_id = formCollection && formCollection.bo_id,
              formOptions = formCollection && formCollection.options,
              addItemController = formOptions && formOptions.metadataAddItemController,
              dialog = addItemController && addItemController.dialog,
              marker = dialog && dialog.$(".binf-modal-content .binf-modal-body .cs-add-item-metadata-form"),
              boattributes = {
                id: undefined,
                bo_id:bo_id,
                bo_type_id: generalData.bo_type_id,
                bo_type_name: generalData.bo_type_name,
                ext_system_id: generalData.ext_system_id,
                ext_system_name: generalData.ext_system_name,
                change_reference:true,
                complete_reference:true
              },
              metadataView = addItemController && addItemController.metadataAddItemPropView,
              propertiesView = metadataView && metadataView.metadataPropertiesView;

          // in create mode, we disallow adding classifications, so we workaround CWS-2188
          if (propertiesView) {
            disableClassificationsAdd(propertiesView,this);
          }

          return getReferencePanel(this,mode,marker,boattributes);

        }
      }

      return null;
    }
  });

  return ReferencePanelController;
});

csui.define('xecmpf/controls/property.panels/reference/reference.panel',[
  'xecmpf/controls/property.panels/reference/reference.panel.controller'
], function (ReferencePanelController) {

  return [{
      sequence  : 10,
      controller: ReferencePanelController
  }];

});

csui.define('xecmpf/dialogs/node.picker/start.locations/businessobjecttypes.container/businessobjecttypes.container.factory',['csui/lib/underscore', 'csui/lib/jquery',
  'csui/dialogs/node.picker/start.locations/node.base.factory'
], function (_, $, NodeBaseFactory) {
  "use strict";
  var BusinessObjectTypesContainerFactory = NodeBaseFactory.extend({
    constructor: function BusinessWorkspaceVolumeFactory(options) {
      options = _.defaults({
        node: {
          type: 888
        }
      }, options);
      NodeBaseFactory.prototype.constructor.call(this, options);
    },
    updateLocationModel: function (model) {
      model.set({
        invalid: true
      });
      return $.Deferred().resolve().promise();
    }
  });
  return BusinessObjectTypesContainerFactory;
});


/**
 * @license text 2.0.15 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

csui.define('txt',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }

    //Allow for default ports for http and https.
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }

    text = {
        version: '2.0.15',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || isSamePort(uProtocol, uPort, protocol, port));
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});

/** @license
 * RequireJS plugin for loading JSON files
 * - depends on Text plugin and it was HEAVILY "inspired" by it as well.
 * Author: Miller Medeiros
 * Version: 0.4.0 (2014/04/10)
 * Released under the MIT license
 */
csui.define('json',['txt'], function(text){

    var CACHE_BUST_QUERY_PARAM = 'bust',
        CACHE_BUST_FLAG = '!bust',
        jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function')? JSON.parse : function(val){
            return eval('('+ val +')'); //quick and dirty
        },
        buildMap = {};

    function cacheBust(url){
        url = url.replace(CACHE_BUST_FLAG, '');
        url += (url.indexOf('?') < 0)? '?' : '&';
        return url + CACHE_BUST_QUERY_PARAM +'='+ Math.round(2147483647 * Math.random());
    }

    //API
    return {

        load : function(name, req, onLoad, config) {
            if (( config.isBuild && (config.inlineJSON === false || name.indexOf(CACHE_BUST_QUERY_PARAM +'=') !== -1)) || (req.toUrl(name).indexOf('empty:') === 0)) {
                //avoid inlining cache busted JSON or if inlineJSON:false
                //and don't inline files marked as empty!
                onLoad(null);
            } else {
                text.get(req.toUrl(name), function(data){
                    var parsed;
                    if (config.isBuild) {
                        buildMap[name] = data;
                        onLoad(data);
                    } else {
                        try {
                            parsed = jsonParse(data);
                        } catch (e) {
                            onLoad.error(e);
                        }
                        onLoad(parsed);
                    }
                },
                    onLoad.error, {
                        accept: 'application/json'
                    }
                );
            }
        },

        normalize : function (name, normalize) {
            // used normalize to avoid caching references to a "cache busted" request
            if (name.indexOf(CACHE_BUST_FLAG) !== -1) {
                name = cacheBust(name);
            }
            // resolve any relative paths
            return normalize(name);
        },

        //write method based on RequireJS official text plugin by James Burke
        //https://github.com/jrburke/requirejs/blob/master/text.js
        write : function(pluginName, moduleName, write){
            if(buildMap.hasOwnProperty(moduleName)){
                var content = buildMap[moduleName];
                write.asModule(pluginName +'!'+ moduleName,
                    'define('+ content +');\n');
            }
        }

    };
});


csui.define('json!xecmpf/widgets/workspaces/workspaces.manifest.json',{
  "$schema": "http://opentext.com/cs/json-schema/draft-04/schema#",
  "title": "Workspaces Creation and Completion Widget",
  "description": "User gets a list of early workspaces so he can select one workspace to complete the reference. If the user does not find an appropriate early workspace he can create a new workspace.",
  "schema": {
    "type": "object",
    "properties": {
      "busObjectId": {
        "type": "string",
        "title": "Business object id",
        "description": "ID of a business object"
      },
      "busObjectType": {
        "type": "string",
        "title": "Business object type",
        "description": "Type of a business object"
      },
      "extSystemId": {
        "type": "string",
        "title": "External system id",
        "description": "ID of an external system"
      }
    }
  }
}
);


csui.define('json!xecmpf/widgets/boattachments/boattachments.manifest.json',{
  "$schema": "http://opentext.com/cs/json-schema/draft-04/schema#",
  "title": "Business Attachments",
  "description": "Shows business attachments for a business object",
  "schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "object",
        "title": "Title",
        "description": "Title of the business attachments widget"
      },
      "businessattachment": {
        "type": "object",
        "title": "Business attachment",
        "description": "Business attachment specific options",
        "properties": {
          "properties": {
            "type": "object",
            "title": "Properties",
            "description": "Configuration properties",
            "properties": {
              "busObjectId": {
                "type": "string",
                "title": "Business object id",
                "default": "",
                "description": "ID of the business object whose business attachments are displayed"
              },
              "busObjectType": {
                "type": "string",
                "title": "Business object type",
                "default": "",
                "description": "Type of the business object"
              },
              "extSystemId": {
                "type": "string",
                "title": "Business application ID",
                "default": "",
                "description": "Business application of the business object"
              }
            }
          }
        }
      },
      "collapsedView": {
        "type": "object",
        "title": "Collapsed view",
        "description": "Options for the collapsed view of this widget",
        "properties": {
          "noResultsPlaceholder": {
            "type": "object",
            "title": "Message for empty result",
            "description": "Message if there are no business attachments to display"
          },
          "orderBy": {
            "type": "object",
            "title": "Order by",
            "description": "Sort order of the displayed business attachments",
            "properties": {
              "sortColumn": {
                "type": "string",
                "title": "Column",
                "description": "Column to order by"
              },
              "sortOrder": {
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ],
                "title": "Sort order",
                "description": "Sort order to be used"
              }
            }
          },
          "title": {
            "type": "object",
            "title": "Business attachment title",
            "description": "Title of the business attachment in collapsed view",
            "properties": {
              "value": {
                "type": "string",
                "title": "Title",
                "description": "Value for the Title field"
              }
            }
          },
          "description": {
            "type": "object",
            "title": "Business attachment description",
            "description": "Description of the business attachment in collapsed view",
            "properties": {
              "value": {
                "type": "string",
                "title": "Description",
                "description": "Value for the description field"
              }
            }
          },
          "topRight": {
            "type": "object",
            "title": "Top right metadata field",
            "description": "Metadata displayed in top right metadata field in collapsed view",
            "properties": {
              "label": {
                "type": "object",
                "title": "Label",
                "description": "Label for the metadata field"
              },
              "value": {
                "type": "string",
                "title": "Value",
                "description": "Value for the top right metadata field"
              }
            }
          },
          "bottomLeft": {
            "type": "object",
            "title": "Bottom left  metadata field",
            "description": "Metadata displayed in bottom left metadata field in collapsed view",
            "properties": {
              "label": {
                "type": "object",
                "title": "Label",
                "description": "Label for the metadata field"
              },
              "value": {
                "type": "string",
                "title": "Value",
                "description": "Value for the bottom left metadata field"
              }
            }
          },
          "bottomRight": {
            "type": "object",
            "title": "Bottom right metadata field",
            "description": "Metadata displayed in bottom right metadata field in collapsed view",
            "properties": {
              "label": {
                "type": "object",
                "title": "Label",
                "description": "Label for the metadata field"
              },
              "value": {
                "type": "string",
                "title": "Value",
                "description": "Value for the bottom right metadata  metadata field"
              }
            }
          }
        }
      },
      "expandedView": {
        "type": "object",
        "title": "Expanded view",
        "description": "Options for the expanded view of this widget",
        "properties": {
          "orderBy": {
            "type": "object",
            "title": "Order by",
            "description": "Sort order of the displayed business attachments",
            "properties": {
              "sortColumn": {
                "type": "string",
                "title": "Column",
                "description": "Column to order by"
              },
              "sortOrder": {
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ],
                "title": "Sort order",
                "description": "Sort order to be used"
              }
            }
          }
        }
      },
      "snapshot": {
        "type": "object",
        "title": "Snapshot",
        "description": "Options for the snapshots of Business Attachments",
        "properties": {
          "parentFolderName": {
            "type": "string",
            "title": "Parent folder name",
            "description": "Folder in business workspace, where Snapshots are created."
          },
          "folderNamePrefix": {
            "type": "string",
            "title": "Snapshot name prefix",
            "description": "The name of a snapshot consists of the prefix and a timestamp."
          }
        }
      }
    }
  },
  "options": {
    "fields": {
      "businessattachment": {
        "fields": {
          "properties": {
            "fields": {
              "busObjectId": {
                "type": "otconws_metadata_string"
              },
              "busObjectType": {
                "type": "otconws_metadata_string"
              },
              "extSystemId": {
                "type": "otconws_metadata_string"
              }
            }
          }
        }
      },
      "title": {
        "type": "otcs_multilingual_string"
      },
      "collapsedView": {
        "fields": {
          "noResultsPlaceholder": {
            "type": "otcs_multilingual_string"
          },
          "orderBy": {
            "fields": {
              "sortColumn": {
                "type": "otconws_customcolumn"
              },
              "sortOrder": {
                "type": "select",
                "optionLabels": [
                  "Ascending",
                  "Descending"
                ]
              }
            }
          },
          "title": {
            "fields": {
              "value": {
                "type": "otconws_customcolumn"
              }
            }
          },
          "description": {
            "fields": {
              "value": {
                "type": "otconws_customcolumn"
              }
            }
          },
          "topRight": {
            "fields": {
              "label": {
                "type": "otcs_multilingual_string"
              },
              "value": {
                "type": "otconws_customcolumn"
              }
            }
          },
          "bottomLeft": {
            "fields": {
              "label": {
                "type": "otcs_multilingual_string"
              },
              "value": {
                "type": "otconws_customcolumn"
              }
            }
          },
          "bottomRight": {
            "fields": {
              "label": {
                "type": "otcs_multilingual_string"
              },
              "value": {
                "type": "otconws_customcolumn"
              }
            }
          }
        }
      },
      "expandedView": {
        "fields": {
          "orderBy": {
            "fields": {
              "sortColumn": {
                "type": "otconws_customcolumn"
              },
              "sortOrder": {
                "type": "select",
                "optionLabels": [
                  "Ascending",
                  "Descending"
                ]
              }
            }
          }
        }
      },
      "snapshot": {
        "fields": {
          "parentFolderName": {
            "type": "text"
          },
          "folderNamePrefix": {
            "type": "text"
          }
        }
      }
    }
  }
}
);


csui.define('json!xecmpf/widgets/dossier/dossier.manifest.json',{
  "$schema": "http://opentext.com/cs/json-schema/draft-04/schema#",
  "title": "Dossier",
  "description": "Dossier View for business workspaces grouped by some criterion say create date ,classification",
  "schema": {
    "type": "object",
    "properties": {
      "groupBy": {
        "type": "string",
        "enum": [
          "classification",
          "create_date"
        ],
        "default": "create_date",
        "title": "Default group by criterion",
        "description": "Group by criterion that dossier view will use to load for the first time"
      },
      "hideGroupByCriterionDropdown": {
        "type": "boolean",
        "enum": [
          true,
          false
        ],
        "default": false,
        "title": "Hide group by criterion dropdown",
        "description": "Option to hide the dropdown to choose the group by criterion"
      },
      "hideMetadata": {
        "type": "boolean",
        "enum": [
          true,
          false
        ],
        "default": false,
        "title": "Hide metadata",
        "description": "Option to hide the document's metadata view"
      },
      "metadata": {
        "type": "array",
        "title": "Metadata",
        "description": "Metadata displayed for document",
        "items": {
          "type": "object",
          "title": "Category or attribute",
          "description": "Category or attribute with metadata"
        }
      },
      "hideEmptyFields": {
        "type": "boolean",
        "enum": [
          true,
          false
        ],
        "default": false,
        "title": "Hide empty fields",
        "description": "Display only fields with values"
      },
      "hideFavorite": {
        "type": "boolean",
        "enum": [
          true,
          false
        ],
        "default": false,
        "title": "Hide favorite",
        "description": "Option to hide the favorite icon"
      }
    }
  },
  "options": {
    "fields": {
      "groupBy": {
        "type": "select",
        "optionLabels": [
          "Classification",
          "Create Date"
        ]
      },
      "metadata": {
        "fields": {
          "item": {
            "type": "otconws_metadata"
          }
        }
      }
    }
  }
}
);


csui.define('json!xecmpf/widgets/header/header.manifest.json',{
  "$schema": "http://opentext.com/cs/json-schema/draft-04/schema#",
  "title": "Header",
  "description": "Header widget for business workspaces",
  "schema": {
    "type": "object",
    "properties": {
      "workspace": {
        "type": "object",
        "title": "Workspace",
        "description": "Workspace specific options",
        "properties": {
          "properties": {
            "type": "object",
            "title": "Properties",
            "description": "Configuration properties",
            "properties": {
              "title": {
                "type": "string",
                "title": "Title",
                "default": "{name}",
                "description": "Name of the business workspace"
              },
              "type": {
                "type": "string",
                "title": "Type",
                "default": "{business_properties.workspace_type_name}",
                "description": "Name of the workspace type"
              },
              "description": {
                "type": "string",
                "title": "Description",
                "default": "{description}",
                "description": "Description of the business workspace"
              }
            }
          }
        }
      },
      "completenessCheckSettings": {
        "type": "object",
        "title": "Completeness check",
        "description": "Completeness check configuration",
        "properties": {
          "hideMissingDocsCheck": {
            "title": "Hide missing documents check",
            "description": "Option to show or hide the missing document check",
            "type": "boolean",
            "default": false
          },
          "hideOutdatedDocsCheck": {
            "title": "Hide outdated documents check",
            "description": "Option to show or hide the outdated document check. This option will be effective only if the Extended ECM for SAP SuccessFactors module is installed on the system",
            "type": "boolean",
            "default": false
          },
          "hideInProcessDocsCheck": {
            "title": "Hide In process documents check",
            "description": "Option to show or hide the In process document check. This option will be effective only if the Extended ECM for SAP SuccessFactors module is installed on the system",
            "type": "boolean",
            "default": false
          }
        }
      },
      "headerwidget": {
        "type": "object",
        "title": "Widget",
        "description": "Additional widget that can be embedded in the header widget",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "none",
              "activityfeed",
              "metadata"
            ],
            "default": "none",
            "title": "Embed widget",
            "description": "Widget to be embedded in the header widget"
          }
        }
      },
      "metadataSettings": {
        "type": "object",
        "title": "Metadata",
        "description": "Header metadata configuration",
        "properties": {  
          "metadataInColumns":{          
            "type": "string",			
            "enum": [
              "singleCol",
              "doubleCol"
            ],
            "default": "doubleCol",
            "title": "Show Metadata In Columns",
            "description": "Show Metadata In Columns"
        },      
          "hideMetadata": {
            "type": "boolean",
            "enum": [
              true,
              false
            ],
            "default": false,
            "title": "Hide Metadata",
            "description": "Hide metadata on header"
          },
          "hideEmptyFields": {
            "type": "boolean",
            "enum": [
              true,
              false
            ],
            "default": false,
            "title": "Hide empty fields",
            "description": "Display only fields with values"
          },
          "metadata": {
            "type": "array",
            "title": "Metadata",
            "description": "Metadata displayed in Header widget",
            "items": {
              "type": "object",
              "title": "Category or attribute",
              "description": "Category or attribute with metadata"
            }
          }
        }
      },
      "favoriteSettings": {
        "type": "object",
        "title": "Favorite",
        "description": "Favorite configuration",
        "properties": {
          "hideFavorite": {
            "type": "boolean",
            "enum": [
              true,
              false
            ],
            "default": false,
            "title": "Hide Favorite",
            "description": "Option to hide the favorite icon on the header"
          }
        }
      }
    }
  },
  "options": {
    "fields": {
      "workspace": {
        "fields": {
          "properties": {
            "fields": {
              "title": {
                "type": "otconws_metadata_string"
              },
              "type": {
                "type": "otconws_metadata_string"
              },
              "description": {
                "type": "otconws_metadata_string"
              }
            }
          }
        }
      },
      "metadataSettings": {
        "fields": {
            "metadata": {
              "fields": {                        
                "item": {
                  "type": "otconws_metadata"          
                }
              }
            },
          "metadataInColumns": {
            "type": "select",            
            "optionLabels": [
              "Single",
              "Double"
            ]
          }
        }
      },
      
      "headerwidget": {
        "fields": {
          "type": {
            "type": "select",
            "optionLabels": [
              "None",
              "Activity Feed",
              "Metadata"
            ]
          }
        }
      }
    }
  }
}
);


csui.define('json!xecmpf/widgets/scan/scan.manifest.json',{
  "$schema": "http://opentext.com/cs/json-schema/draft-04/schema",
  "title": "{{widgetTitle}}",
  "description": "{{widgetDescription}}",
  "schema": {
    "type": "object",
    "properties": {
      "businessobjecttypes": {
        "title": "{{botypesTitle}}",
        "description": "{{botypesDescription}}",
        "type": "array",
        "items":{
          "type":"object",
          "properties": {
            "id":{
              "type":"integer",
			  "description": "{{botypeBrowseDescription}}",
              "title":"{{botypeBrowseTitle}}"
            }
          }
        }
      }
    }
  },
  "options": {
    "fields": {
      "businessobjecttypes": {
        "items":{
          "fields":{
            "id":{
              "type": "otcs_node_picker",
              "type_control": {
                "parameters": {
                  "select_types": [889],
                  "startLocation":"xecmpf/dialogs/node.picker/start.locations/businessobjecttypes.container"
                }
              }
            }

          }
        }
      }
    }
  }
}
);


csui.define('json!xecmpf/utils/perspective/custom.search.json',{
  "type": "grid",
  "options": {
    "rows": [
      {
        "columns": [
          {
            "sizes": {
              "md": 12
            },
            "heights": {
              "xs": "full"
            },
            "widget": {
              "type": "xecmpf/widgets/integration/folderbrowse/search.results",
              "options": {
                "enableBackButton": true
              }
            }
          }
        ]
      }
    ]
  }
}
);

csui.define('xecmpf/widgets/scan/impl/nls/scan.manifest',{
  // Always load the root bundle for the default locale (en-us)
  "root": true,
  // Do not load English locale bundle provided by the root bundle
  "en-us": false,
  "en": false
});

csui.define('xecmpf/widgets/scan/impl/nls/root/scan.manifest',{
  widgetTitle:"Scan barcode",
  widgetDescription:"Scans the barcode and opens the corresponding workspace",
  botypesTitle: 'Business Object Types',
  botypesDescription:"List of business object types which are relavant for the scan",
  botypeBrowseTitle:"Business Object Type",
  botypeBrowseDescription:"Select the business object type which is relavant for the scan"
});

csui.define('xecmpf/utils/perspective/custom.search.perspective',['csui/lib/backbone'], function (Backbone) {
  return [
    {
      decides: function () {
        return !!Backbone.history.root.match("xecm");
      },
      module: 'json!xecmpf/utils/perspective/custom.search.json'
    }
  ];
});

csui.define('xecmpf/utils/perspective/eventactionnode.perspective',[],function () {
    'use strict';
    return [
      {
        equals: {type: [898]},
        important: true,
        module: 'json!xecmpf/utils/perspective/impl/perspectives/eventaction.json'
      }
    ];
  
  });

csui.define('json!xecmpf/utils/perspective/impl/perspectives/eventaction.json',{
    "type": "grid",
    "options": {
      "rows": [
        {
          "columns": [
            {
              "sizes": {
                "md": 12
              },
              "heights": {
                "xs": "full"
              },
              "widget": {
                "type": "xecmpf/widgets/eac"
              }
            }
          ]
        }
      ]
    }
  }
  );

// Placeholder for the build target file; the name must be the same,
// include public modules from this component

csui.define('bundles/xecmpf-app',[
  //Pages
  'xecmpf/pages/start/perspective-only.page.view',

  //Search box widget extension
  'xecmpf/widgets/integration/folderbrowse/search.box.view',

  //Page as dialog
  'xecmpf/widgets/integration/folderbrowse/full.page.workspace.view',

  //Custom Search Results
  'xecmpf/widgets/integration/folderbrowse/search.results/search.results.view',

  // Custom modal dialog for Full page wokrspace
  'xecmpf/widgets/integration/folderbrowse/modaldialog/modal.dialog.view',

  // Commands
  'xecmpf/utils/commands/folderbrowse/go.to.workspace.history',
  'xecmpf/utils/commands/folderbrowse/search.container',
  'xecmpf/utils/commands/folderbrowse/open.full.page.workspace',
  'xecmpf/utils/commands/workspaces/workspace.delete',
  'xecmpf/utils/commands/boattachments/boattachments.create',
  'xecmpf/utils/commands/eac/eac.refresh',
  'xecmpf/utils/commands/eac/eac.back',
  'xecmpf/utils/commands/open.eventaction',
  'xecmpf/utils/eventaction.defaultaction',
  'xecmpf/widgets/boattachments/impl/boattachment.table/commands/snapshot',
  'xecmpf/utils/commands/collapse.page.overlay',

  // Toolbar buttons
  'xecmpf/widgets/integration/folderbrowse/toolbaritems',
  'xecmpf/widgets/header/headertoolbaritems',
  'xecmpf/widgets/header/commonheadertoolbaritems',

  // Cell views
  'xecmpf/widgets/boattachments/impl/boattachment.table/tablecell/createdby.view',
  'xecmpf/widgets/boattachments/impl/boattachment.table/tablecell/modifiedby.view',
  'xecmpf/controls/table/cells/eac.actionplan.view',

  // Inline forms

  // Integration widgets

  // workspace reference
  'xecmpf/controls/bosearch/bosearch.dialog.controller',
  'xecmpf/controls/property.panels/reference/impl/reference.panel.view',

  // Public widgets
  'xecmpf/widgets/boattachments/boattachments.view',

  // Application widgets
  'xecmpf/widgets/workspaces/workspaces.widget',

  // Metadata widget extensions
  // Metadata panel collection
  'xecmpf/widgets/myattachments/metadata.property.panels',

  // Widgets
  'xecmpf/widgets/dossier/dossier.view',
  'xecmpf/widgets/eac/eac.view',
  'xecmpf/widgets/header/header.view',
  'xecmpf/widgets/scan/scan.view',

  // Public Views
  'xecmpf/utils/document.thumbnail/document.thumbnail.view',
  'xecmpf/controls/savedquery.node.picker/savedquery.node.picker.view',
  'xecmpf/controls/savedquery.node.picker/impl/savedquery.form.view',
  'xecmpf/controls/search.textbox/search.textbox.view',
  
  // Public Controls
  'xecmpf/controls/property.panels/reference/reference.panel',
  'xecmpf/dialogs/node.picker/start.locations/businessobjecttypes.container/businessobjecttypes.container.factory',

  // Application widgets manifests
  'json!xecmpf/widgets/workspaces/workspaces.manifest.json',
  'json!xecmpf/widgets/boattachments/boattachments.manifest.json',
  'json!xecmpf/widgets/dossier/dossier.manifest.json',
  'json!xecmpf/widgets/header/header.manifest.json',
  'json!xecmpf/widgets/scan/scan.manifest.json',
  'json!xecmpf/utils/perspective/custom.search.json',

  // Application widgets nls language files
  'i18n!xecmpf/widgets/scan/impl/nls/scan.manifest',
  'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
  'i18n!xecmpf/controls/property.panels/reference/impl/nls/lang',

  // Perspective overrides
  'xecmpf/utils/perspective/custom.search.perspective',

  //Utils
  'xecmpf/widgets/boattachments/impl/boattachmentutil',

  //eventaction Content
  'xecmpf/utils/perspective/eventactionnode.perspective',

  //eventaction perspective
  'json!xecmpf/utils/perspective/impl/perspectives/eventaction.json'

], {});

csui.require(['require', 'css'], function (require, css) {
  css.styleLoad(require, 'xecmpf/bundles/xecmpf-app', true);
});

