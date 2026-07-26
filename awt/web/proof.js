"use strict";
(function(module) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports)  {
            module(exports);
        });
    } else if (typeof exports === 'object' && exports !== null && typeof exports.nodeName !== 'string') {
        module(exports);
    } else {
        module(typeof self !== 'undefined' ? self : this);
}
}(function($rt_exports) {
let $rt_seed = 2463534242,
$rt_nextId = () => {
    let x = $rt_seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    $rt_seed = x;
    return x;
},
$rt_wrapFunction0 = f => function() {
    return f(this);
},
$rt_wrapFunction1 = f => function(p1) {
    return f(this, p1);
},
$rt_wrapFunction2 = f => function(p1, p2) {
    return f(this, p1, p2);
},
$rt_wrapFunction3 = f => function(p1, p2, p3) {
    return f(this, p1, p2, p3);
},
$rt_wrapFunction4 = f => function(p1, p2, p3, p4) {
    return f(this, p1, p2, p3, p4);
},
$rt_mainStarter = f => (args, callback) => {
    if (!args) {
        args = [];
    }
    let javaArgs = $rt_createArray($rt_objcls(), args.length);
    for (let i = 0;i < args.length;++i) {
        javaArgs.data[i] = $rt_str(args[i]);
    }
    $rt_startThread(() => {
        f.call(null, javaArgs);
    }, callback);
},
$rt_eraseClinit = target => target.$clinit = () => {
},
$dbg_class = obj => {
    let cls = obj.constructor;
    let arrayDegree = 0;
    while (cls[$rt_meta] && cls[$rt_meta].item) {
        ++arrayDegree;
        cls = cls[$rt_meta].item;
    }
    let clsName = "";
    if (cls[$rt_meta].primitiveKind !== 0) {
        clsName = cls[$rt_meta].name;
    } else {
        clsName = cls[$rt_meta] ? cls[$rt_meta].name || "a/" + cls.name : "@" + cls.name;
    }
    while (arrayDegree-- > 0) {
        clsName += "[]";
    }
    return clsName;
},
$rt_classWithoutFields = superclass => {
    if (superclass === 0) {
        return function() {
        };
    }
    if (superclass === void 0) {
        superclass = $rt_objcls();
    }
    return function() {
        superclass.call(this);
    };
},
$rt_meta = Symbol("teavm_meta"),
$rt_cls = cls => {
    if (cls[$rt_meta].classObject === null) {
        cls[$rt_meta].classObject = jl_Class_createClass(cls);
    }
    return cls[$rt_meta].classObject;
},
$rt_objcls = () => jl_Object,
$rt_callWithReceiver = f => function() {
    return f.apply(null, [this].concat(Array.prototype.slice.call(arguments)));
},
$rt_newClassMetadata = source => {
    return Object.assign({ name : null, binaryName : null, parent : null, superinterfaces : [], modifiers : 0, primitiveKind : 0, itemType : null, arrayType : null, enclosingClass : null, declaringClass : null, simpleName : null, clinit : () => {
    }, constructor : null, enumConstants : () => null, resolvedEnumConstants : null, reflection : null, classObject : null, assignableCache : null, valueToObject : o => o, objectToValue : o => o }, source || {  });
},
$rt_createPrimitiveCls = (name, binaryName, kind, config) => {
    let cls = () => {
    };
    let meta = $rt_newClassMetadata({ name : name, binaryName : binaryName, modifiers : 1 | 1 << 4, primitiveKind : kind });
    cls[$rt_meta] = meta;
    if (typeof config === 'function') {
        config(meta);
    }
    return cls;
},
$rt_booleancls = $rt_createPrimitiveCls("boolean", "Z", 1, meta => {
    {
        meta.valueToObject = o => jl_Boolean_valueOf(o);
    }
}),
$rt_bytecls = $rt_createPrimitiveCls("byte", "B", 2, meta => {
}),
$rt_shortcls = $rt_createPrimitiveCls("short", "S", 3, meta => {
}),
$rt_charcls = $rt_createPrimitiveCls("char", "C", 4, meta => {
}),
$rt_intcls = $rt_createPrimitiveCls("int", "I", 5, meta => {
    {
        meta.valueToObject = o => jl_Integer_valueOf(o);
    }
    {
        meta.objectToValue = o => jl_Integer_intValue(o);
    }
}),
$rt_longcls = $rt_createPrimitiveCls("long", "J", 6, meta => {
}),
$rt_doublecls = $rt_createPrimitiveCls("double", "D", 8, meta => {
}),
$rt_voidcls = $rt_createPrimitiveCls("void", "V", 9),
$rt_numberConversionBuffer = new ArrayBuffer(16),
$rt_numberConversionDoubleArray = new Float64Array($rt_numberConversionBuffer),
$rt_numberConversionLongArray = new BigInt64Array($rt_numberConversionBuffer),
$rt_doubleToRawLongBits = n => {
    $rt_numberConversionDoubleArray[0] = n;
    return $rt_numberConversionLongArray[0];
},
$rt_compare = (a, b) => a === b ? 0 : a < b ?  -1 : 1,
$rt_compare_less = (a, b) => a === b ? 0 : a > b ? 1 :  -1,
$rt_imul = Math.imul || function(a, b) {
    let ah = a >>> 16 & 0xFFFF;
    let al = a & 0xFFFF;
    let bh = b >>> 16 & 0xFFFF;
    let bl = b & 0xFFFF;
    return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
},
$rt_udiv = (a, b) => (a >>> 0) / (b >>> 0) >>> 0,
$rt_umod = (a, b) => (a >>> 0) % (b >>> 0) >>> 0,
$rt_ucmp = (a, b) => {
    a >>>= 0;
    b >>>= 0;
    return a < b ?  -1 : a > b ? 1 : 0;
},
Long_ZERO = BigInt(0),
Long_create = (lo, hi) => BigInt.asIntN(64, BigInt.asUintN(64, BigInt(lo)) | BigInt.asUintN(64, BigInt(hi) << BigInt(32))),
Long_fromInt = val => BigInt.asIntN(64, BigInt(val | 0)),
Long_fromNumber = val => BigInt.asIntN(64, BigInt(val >= 0 ? Math.floor(val) : Math.ceil(val))),
Long_toNumber = val => Number(val),
Long_lo = val => Number(BigInt.asIntN(32, val)) | 0,
Long_eq = (a, b) => a === b,
Long_ge = (a, b) => a >= b,
Long_le = (a, b) => a <= b,
Long_add = (a, b) => BigInt.asIntN(64, a + b),
Long_sub = (a, b) => BigInt.asIntN(64, a - b),
Long_ucompare = (a, b) => {
    a = BigInt.asUintN(64, a);
    b = BigInt.asUintN(64, b);
    return a < b ?  -1 : a > b ? 1 : 0;
},
Long_mul = (a, b) => BigInt.asIntN(64, a * b),
Long_div = (a, b) => BigInt.asIntN(64, a / b),
Long_udiv = (a, b) => BigInt.asIntN(64, BigInt.asUintN(64, a) / BigInt.asUintN(64, b));
let Long_rem = (a, b) => BigInt.asIntN(64, a % b),
Long_and = (a, b) => BigInt.asIntN(64, a & b),
Long_or = (a, b) => BigInt.asIntN(64, a | b),
Long_shl = (a, b) => BigInt.asIntN(64, a << BigInt(b & 63)),
Long_shr = (a, b) => BigInt.asIntN(64, a >> BigInt(b & 63)),
Long_shru = (a, b) => BigInt.asIntN(64, BigInt.asUintN(64, a) >> BigInt(b & 63)),
$rt_createArray = (cls, sz) => {
    let data = new Array(sz);
    data.fill(null);
    return new ($rt_arraycls(cls))(data);
},
$rt_wrapArray = (cls, data) => new ($rt_arraycls(cls))(data),
$rt_createLongArrayFromData = data => {
    let buffer = new BigInt64Array(data.length);
    buffer.set(data);
    return new $rt_longArrayCls(buffer);
},
$rt_createCharArray = sz => new $rt_charArrayCls(new Uint16Array(sz)),
$rt_createByteArray = sz => new $rt_byteArrayCls(new Int8Array(sz)),
$rt_createByteArrayFromData = data => {
    let buffer = new Int8Array(data.length);
    buffer.set(data);
    return new $rt_byteArrayCls(buffer);
},
$rt_createShortArrayFromData = data => {
    let buffer = new Int16Array(data.length);
    buffer.set(data);
    return new $rt_shortArrayCls(buffer);
},
$rt_createIntArray = sz => new $rt_intArrayCls(new Int32Array(sz)),
$rt_createIntArrayFromData = data => {
    let buffer = new Int32Array(data.length);
    buffer.set(data);
    return new $rt_intArrayCls(buffer);
},
$rt_createBooleanArray = sz => new $rt_booleanArrayCls(new Int8Array(sz)),
$rt_createDoubleArrayFromData = data => {
    let buffer = new Float64Array(data.length);
    buffer.set(data);
    return new $rt_doubleArrayCls(buffer);
},
$rt_arraycls = cls => {
    let result = cls[$rt_meta].arrayType;
    if (result === null) {
        function JavaArray(data) {
            ($rt_objcls()).call(this);
            this.data = data;
        }
        JavaArray.prototype = Object.create(($rt_objcls()).prototype);
        JavaArray.prototype.type = cls;
        JavaArray.prototype.constructor = JavaArray;
        JavaArray.prototype.toString = function() {
            let str = "[";
            for (let i = 0;i < this.data.length;++i) {
                if (i > 0) {
                    str += ", ";
                }
                str += this.data[i].toString();
            }
            str += "]";
            return str;
        };
        JavaArray.prototype.$clone = function() {
            let dataCopy;
            if ('slice' in this.data) {
                dataCopy = this.data.slice();
            } else {
                dataCopy = new this.data.constructor(this.data.length);
                for (let i = 0;i < dataCopy.length;++i) {
                    dataCopy[i] = this.data[i];
                }
            }
            return new ($rt_arraycls(this.type))(dataCopy);
        };
        let name = "[" + cls[$rt_meta].binaryName;
        JavaArray[$rt_meta] = $rt_newClassMetadata({ name : name, binaryName : name, parent : $rt_objcls(), itemType : cls });
        result = JavaArray;
        cls[$rt_meta].arrayType = JavaArray;
    }
    return result;
};
function $rt_arrayLength(array) {
    return array.data.length;
}
let $rt_stringPool_instance,
$rt_stringPool = strings => {
    $rt_stringClassInit();
    $rt_stringPool_instance = new Array(strings.length);
    for (let i = 0;i < strings.length;++i) {
        $rt_stringPool_instance[i] = $rt_intern($rt_str(strings[i]));
    }
},
$rt_s = index => $rt_stringPool_instance[index],
$rt_charArrayToString = (array, offset, count) => {
    let result = "";
    let limit = offset + count;
    for (let i = offset;i < limit;i = i + 1024 | 0) {
        let next = Math.min(limit, i + 1024 | 0);
        result += String.fromCharCode.apply(null, array.subarray(i, next));
    }
    return result;
},
$rt_fullArrayToString = array => $rt_charArrayToString(array, 0, array.length),
$rt_str = str => str === null ? null : jl_String__init_0(str),
$rt_ustr = str => str === null ? null : str.$nativeString,
$rt_stringClassInit = () => jl_String_$callClinit(),
$rt_intern;
{
    $rt_intern = str => str;
}
let $rt_isInstance = (obj, cls) => obj instanceof $rt_objcls() && !!obj.constructor[$rt_meta] && $rt_isAssignable(obj.constructor, cls),
$rt_isAssignable = (from, to) => {
    if (from === to) {
        return true;
    }
    let map = from[$rt_meta].assignableCache;
    if (map === null) {
        map = new Map();
        from[$rt_meta].assignableCache = map;
    }
    let cachedResult = map.get(to);
    if (typeof cachedResult !== 'undefined') {
        return cachedResult;
    }
    if (to[$rt_meta].itemType !== null) {
        let result = from[$rt_meta].itemType !== null && $rt_isAssignable(from[$rt_meta].itemType, to[$rt_meta].itemType);
        map.set(to, result);
        return result;
    }
    let parent = from[$rt_meta].parent;
    if (parent !== null && parent !== from) {
        if ($rt_isAssignable(parent, to)) {
            map.set(to, true);
            return true;
        }
    }
    let superinterfaces = from[$rt_meta].superinterfaces;
    for (let i = 0;i < superinterfaces.length;i = i + 1 | 0) {
        if ($rt_isAssignable(superinterfaces[i], to)) {
            map.set(to, true);
            return true;
        }
    }
    map.set(to, false);
    return false;
},
$rt_throw = ex => {
    throw $rt_exception(ex);
},
$rt_javaExceptionProp = Symbol("javaException"),
$rt_exception = ex => {
    if (!ex.$jsException) {
        $rt_fillNativeException(ex);
    }
    return ex.$jsException;
},
$rt_fillNativeException = ex => {
    let javaCause = $rt_throwableCause(ex);
    let jsCause = javaCause !== null ? javaCause.$jsException : void 0;
    let cause = typeof jsCause === "object" ? { cause : jsCause } : void 0;
    let err = new JavaError("Java exception thrown", cause);
    if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(err);
    }
    err[$rt_javaExceptionProp] = ex;
    ex.$jsException = err;
    $rt_fillStack(err, ex);
},
$rt_fillStack = (err, ex) => {
    if (typeof $rt_decodeStack === "function" && err.stack) {
        let stack = $rt_decodeStack(err.stack);
        let javaStack = $rt_createArray($rt_stecls(), stack.length);
        let elem;
        let noStack = false;
        for (let i = 0;i < stack.length;++i) {
            let element = stack[i];
            elem = $rt_createStackElement($rt_str(element.className), $rt_str(element.methodName), $rt_str(element.fileName), element.lineNumber);
            if (elem == null) {
                noStack = true;
                break;
            }
            javaStack.data[i] = elem;
        }
        if (!noStack) {
            $rt_setStack(ex, javaStack);
        }
    }
},
JavaError;
if (typeof Reflect === 'object') {
    let defaultMessage = Symbol("defaultMessage");
    JavaError = function JavaError(message, cause) {
        let self = Reflect.construct(Error, [void 0, cause], JavaError);
        Object.setPrototypeOf(self, JavaError.prototype);
        self[defaultMessage] = message;
        return self;
    }
    ;
    JavaError.prototype = Object.create(Error.prototype, { constructor : { configurable : true, writable : true, value : JavaError }, message : { get() {
        try {
            let javaException = this[$rt_javaExceptionProp];
            if (typeof javaException === 'object') {
                let javaMessage = $rt_throwableMessage(javaException);
                if (typeof javaMessage === "object") {
                    return javaMessage !== null ? javaMessage.toString() : null;
                }
            }
            return this[defaultMessage];
        } catch (e){
            return "Exception occurred trying to extract Java exception message: " + e;
        }
    } } });
} else {
    JavaError = Error;
}
let $rt_javaException = e => e instanceof Error && typeof e[$rt_javaExceptionProp] === 'object' ? e[$rt_javaExceptionProp] : null,
$rt_wrapException = err => {
    let ex = err[$rt_javaExceptionProp];
    if (!ex) {
        ex = $rt_createException($rt_str("(JavaScript) " + err.toString()));
        err[$rt_javaExceptionProp] = ex;
        ex.$jsException = err;
        $rt_fillStack(err, ex);
    }
    return ex;
},
$rt_createException = message => jl_RuntimeException__init_2(message),
$rt_throwableMessage = t => jl_Throwable_getMessage(t),
$rt_throwableCause = t => jl_Throwable_getCause(t),
$rt_stecls = () => $rt_objcls(),
$rt_createStackElement = (className, methodName, fileName, lineNumber) => {
    {
        return null;
    }
},
$rt_setStack = (e, stack) => {
},
$rt_packageData = null,
$rt_packages = data => {
    let i = 0;
    let packages = new Array(data.length);
    for (let j = 0;j < data.length;++j) {
        let prefixIndex = data[i++];
        let prefix = prefixIndex >= 0 ? packages[prefixIndex] : "";
        packages[j] = prefix + data[i++] + ".";
    }
    $rt_packageData = packages;
},
$rt_allClasses = [],
$rt_metadata = data => {
    let packages = $rt_packageData;
    let i = 0;
    while (i < data.length) {
        let cls = data[i++];
        $rt_allClasses.push(cls);
        let m = $rt_newClassMetadata();
        cls[$rt_meta] = m;
        let className = data[i++];
        m.name = className !== 0 ? className : null;
        if (m.name !== null) {
            let packageIndex = data[i++];
            if (packageIndex >= 0) {
                m.name = packages[packageIndex] + m.name;
            }
        }
        m.binaryName = "L" + m.name + ";";
        let superclass = data[i++];
        m.parent = superclass !== 0 ? superclass : null;
        m.superinterfaces = data[i++];
        if (m.parent) {
            cls.prototype = Object.create(m.parent.prototype);
        } else {
            cls.prototype = {  };
        }
        cls.prototype.constructor = cls;
        m.modifiers = data[i++];
        m.primitiveKind = 0;
        let innerClassInfo = data[i++];
        if (innerClassInfo !== 0) {
            let enclosingClass = innerClassInfo[0];
            m.enclosingClass = enclosingClass !== 0 ? enclosingClass : null;
            let declaringClass = innerClassInfo[1];
            m.declaringClass = declaringClass !== 0 ? declaringClass : null;
            let simpleName = innerClassInfo[2];
            m.simpleName = simpleName !== 0 ? simpleName : null;
        }
        let clinit = data[i++];
        m.clinit = clinit !== 0 ? () => {
            m.clinit = () => {
            };
            clinit();
        } : () => {
        };
        let virtualMethods = data[i++];
        if (virtualMethods !== 0) {
            for (let j = 0;j < virtualMethods.length;j += 2) {
                let name = virtualMethods[j];
                let func = virtualMethods[j + 1];
                if (typeof name === 'string') {
                    name = [name];
                }
                for (let k = 0;k < name.length;++k) {
                    cls.prototype[name[k]] = func;
                }
            }
        }
    }
},
$rt_startThread = (runner, callback) => {
    let result;
    try {
        result = runner();
    } catch (e){
        result = e;
    }
    if (typeof callback !== 'undefined') {
        callback(result);
    } else if (result instanceof Error) {
        throw result;
    }
};
function jl_Object() {
    this.$id$ = 0;
}
let jl_Object__init_ = $this => {
    return;
},
jl_Object__init_0 = () => {
    let var_0 = new jl_Object();
    jl_Object__init_(var_0);
    return var_0;
},
jl_Object_getClass = $this => {
    return $rt_cls(jl_Object_getClassInfo($this));
},
jl_Object_getClassInfo = var$0 => {
    return var$0.constructor;
},
jl_Object_equals = (var$0, $other) => {
    return var$0 !== $other ? 0 : 1;
},
jl_Object_toString = $this => {
    let var$1, var$2, var$3;
    var$1 = jl_Class_getName(jl_Object_getClass($this));
    var$2 = jl_Integer_toHexString(jl_Object_identity($this));
    var$3 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append1(jl_StringBuilder_append(var$3, var$1), 64), var$2);
    return jl_StringBuilder_toString(var$3);
},
jl_Object_identity = $this => {
    let $platformThis;
    $platformThis = $this;
    if (!$platformThis.$id$)
        $platformThis.$id$ = $rt_nextId();
    return $this.$id$;
},
otj_JSObject = $rt_classWithoutFields(0),
c_EventLoop$Task = $rt_classWithoutFields(0);
function c_ScheduledExecutorService$repeating$lambda$_5_1() {
    jl_Object.call(this);
    this.$_028 = null;
}
let c_ScheduledExecutorService$repeating$lambda$_5_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_028 = var$1;
},
c_ScheduledExecutorService$repeating$lambda$_5_1__init_0 = var_0 => {
    let var_1 = new c_ScheduledExecutorService$repeating$lambda$_5_1();
    c_ScheduledExecutorService$repeating$lambda$_5_1__init_(var_1, var_0);
    return var_1;
},
c_ScheduledExecutorService$repeating$lambda$_5_1_run = var$0 => {
    var$0.$_028.$run();
},
c_ScheduledExecutorService$repeating$lambda$_5_1_run$exported$0 = var$1 => {
    var$1.$run();
};
function jl_Throwable() {
    let a = this; jl_Object.call(a);
    a.$message = null;
    a.$cause = null;
    a.$suppressionEnabled = 0;
    a.$writableStackTrace = 0;
}
let jl_Throwable__init_ = $this => {
    jl_Throwable_initNativeException($this);
    $this.$suppressionEnabled = 1;
    $this.$writableStackTrace = 1;
    $this.$fillInStackTrace();
},
jl_Throwable__init_3 = () => {
    let var_0 = new jl_Throwable();
    jl_Throwable__init_(var_0);
    return var_0;
},
jl_Throwable__init_1 = ($this, $message) => {
    jl_Throwable_initNativeException($this);
    $this.$suppressionEnabled = 1;
    $this.$writableStackTrace = 1;
    $this.$fillInStackTrace();
    $this.$message = $message;
},
jl_Throwable__init_2 = var_0 => {
    let var_1 = new jl_Throwable();
    jl_Throwable__init_1(var_1, var_0);
    return var_1;
},
jl_Throwable__init_0 = ($this, $cause) => {
    jl_Throwable_initNativeException($this);
    $this.$suppressionEnabled = 1;
    $this.$writableStackTrace = 1;
    $this.$fillInStackTrace();
    $this.$cause = $cause;
},
jl_Throwable__init_4 = var_0 => {
    let var_1 = new jl_Throwable();
    jl_Throwable__init_0(var_1, var_0);
    return var_1;
},
jl_Throwable_fillInStackTrace = $this => {
    return $this;
},
jl_Throwable_initNativeException = $this => {
    $rt_fillNativeException($this);
},
jl_Throwable_getMessage = $this => {
    return $this.$message;
},
jl_Throwable_getCause = $this => {
    return $this.$cause === $this ? null : $this.$cause;
},
jl_Exception = $rt_classWithoutFields(jl_Throwable),
jl_Exception__init_1 = $this => {
    jl_Throwable__init_($this);
},
jl_Exception__init_2 = () => {
    let var_0 = new jl_Exception();
    jl_Exception__init_1(var_0);
    return var_0;
},
jl_Exception__init_ = ($this, $message) => {
    jl_Throwable__init_1($this, $message);
},
jl_Exception__init_4 = var_0 => {
    let var_1 = new jl_Exception();
    jl_Exception__init_(var_1, var_0);
    return var_1;
},
jl_Exception__init_0 = ($this, $cause) => {
    jl_Throwable__init_0($this, $cause);
},
jl_Exception__init_3 = var_0 => {
    let var_1 = new jl_Exception();
    jl_Exception__init_0(var_1, var_0);
    return var_1;
},
jl_RuntimeException = $rt_classWithoutFields(jl_Exception),
jl_RuntimeException__init_ = $this => {
    jl_Exception__init_1($this);
},
jl_RuntimeException__init_4 = () => {
    let var_0 = new jl_RuntimeException();
    jl_RuntimeException__init_(var_0);
    return var_0;
},
jl_RuntimeException__init_0 = ($this, $message) => {
    jl_Exception__init_($this, $message);
},
jl_RuntimeException__init_2 = var_0 => {
    let var_1 = new jl_RuntimeException();
    jl_RuntimeException__init_0(var_1, var_0);
    return var_1;
},
jl_RuntimeException__init_1 = ($this, $cause) => {
    jl_Exception__init_0($this, $cause);
},
jl_RuntimeException__init_3 = var_0 => {
    let var_1 = new jl_RuntimeException();
    jl_RuntimeException__init_1(var_1, var_0);
    return var_1;
},
jl_IndexOutOfBoundsException = $rt_classWithoutFields(jl_RuntimeException),
jl_IndexOutOfBoundsException__init_ = $this => {
    jl_RuntimeException__init_($this);
},
jl_IndexOutOfBoundsException__init_0 = () => {
    let var_0 = new jl_IndexOutOfBoundsException();
    jl_IndexOutOfBoundsException__init_(var_0);
    return var_0;
},
ag_PathSink = $rt_classWithoutFields(0);
function a_Graphics2D$1() {
    jl_Object.call(this);
    this.$this$03 = null;
}
let a_Graphics2D$1__init_ = ($this, $this$0) => {
    $this.$this$03 = $this$0;
    jl_Object__init_($this);
},
a_Graphics2D$1__init_0 = var_0 => {
    let var_1 = new a_Graphics2D$1();
    a_Graphics2D$1__init_(var_1, var_0);
    return var_1;
},
a_Graphics2D$1_moveTo = ($this, $x, $y) => {
    $this.$this$03.$ctx.moveTo($x, $y);
},
a_Graphics2D$1_lineTo = ($this, $x, $y) => {
    $this.$this$03.$ctx.lineTo($x, $y);
},
a_Graphics2D$1_quadTo = ($this, $cx, $cy, $x, $y) => {
    $this.$this$03.$ctx.quadraticCurveTo($cx, $cy, $x, $y);
},
a_Graphics2D$1_curveTo = ($this, $a, $b, $c, $d, $x, $y) => {
    $this.$this$03.$ctx.bezierCurveTo($a, $b, $c, $d, $x, $y);
},
a_Graphics2D$1_closePath = $this => {
    $this.$this$03.$ctx.closePath();
};
function a_Rectangle() {
    let a = this; jl_Object.call(a);
    a.$x0 = 0;
    a.$y0 = 0;
    a.$width = 0;
    a.$height = 0;
}
let a_Rectangle__init_0 = $this => {
    a_Rectangle__init_($this, 0, 0, 0, 0);
},
a_Rectangle__init_1 = () => {
    let var_0 = new a_Rectangle();
    a_Rectangle__init_0(var_0);
    return var_0;
},
a_Rectangle__init_ = ($this, $x, $y, $w, $h) => {
    jl_Object__init_($this);
    $this.$x0 = $x;
    $this.$y0 = $y;
    $this.$width = $w;
    $this.$height = $h;
},
a_Rectangle__init_2 = (var_0, var_1, var_2, var_3) => {
    let var_4 = new a_Rectangle();
    a_Rectangle__init_(var_4, var_0, var_1, var_2, var_3);
    return var_4;
},
a_Rectangle_setBounds = ($this, $x, $y, $w, $h) => {
    $this.$x0 = $x;
    $this.$y0 = $y;
    $this.$width = $w;
    $this.$height = $h;
},
a_Rectangle_contains = ($this, $px, $py) => {
    return $px >= $this.$x0 && $py >= $this.$y0 && $px < ($this.$x0 + $this.$width | 0) && $py < ($this.$y0 + $this.$height | 0) ? 1 : 0;
},
a_Stroke = $rt_classWithoutFields(0),
ji_Serializable = $rt_classWithoutFields(0),
jl_Number = $rt_classWithoutFields(),
jl_Number__init_ = $this => {
    jl_Object__init_($this);
},
jl_Comparable = $rt_classWithoutFields(0);
function jl_Integer() {
    jl_Number.call(this);
    this.$value1 = 0;
}
let jl_Integer_TYPE = null,
jl_Integer_integerCache = null,
jl_Integer_$callClinit = () => {
    jl_Integer_$callClinit = $rt_eraseClinit(jl_Integer);
    jl_Integer__clinit_();
},
jl_Integer__init_ = ($this, $value) => {
    jl_Integer_$callClinit();
    jl_Number__init_($this);
    $this.$value1 = $value;
},
jl_Integer__init_0 = var_0 => {
    let var_1 = new jl_Integer();
    jl_Integer__init_(var_1, var_0);
    return var_1;
},
jl_Integer_toHexString = $i => {
    jl_Integer_$callClinit();
    return otci_IntegerUtil_toUnsignedLogRadixString($i, 4);
},
jl_Integer_parseInt0 = ($s, $radix) => {
    jl_Integer_$callClinit();
    if ($s !== null)
        return jl_Integer_parseIntImpl($s, 0, jl_String_length($s), $radix);
    $rt_throw(jl_NumberFormatException__init_0($rt_s(0)));
},
jl_Integer_parseIntImpl = ($s, $beginIndex, $endIndex, $radix) => {
    let $negative, var$6, $value, $maxValue, var$9, $digit, var$11, var$12, var$13, var$14;
    jl_Integer_$callClinit();
    if ($beginIndex == $endIndex)
        $rt_throw(jl_NumberFormatException__init_0($rt_s(1)));
    if ($radix >= 2 && $radix <= 36) {
        a: {
            $negative = 0;
            switch ($s.$charAt($beginIndex)) {
                case 43:
                    var$6 = $beginIndex + 1 | 0;
                    break a;
                case 45:
                    $negative = 1;
                    var$6 = $beginIndex + 1 | 0;
                    break a;
                default:
            }
            var$6 = $beginIndex;
        }
        $value = 0;
        $maxValue = 1 + (2147483647 / $radix | 0) | 0;
        if (var$6 == $endIndex)
            $rt_throw(jl_NumberFormatException__init_2());
        while (true) {
            if (var$6 >= $endIndex) {
                if ($negative)
                    $value =  -$value | 0;
                return $value;
            }
            var$9 = var$6 + 1 | 0;
            $digit = jl_Integer_decodeDigit($s.$charAt(var$6));
            if ($digit < 0) {
                var$11 = new jl_NumberFormatException;
                var$12 = jl_String_valueOf($s.$subSequence($beginIndex, $endIndex));
                var$13 = jl_StringBuilder__init_();
                jl_StringBuilder_append(jl_StringBuilder_append(var$13, $rt_s(2)), var$12);
                jl_NumberFormatException__init_(var$11, jl_StringBuilder_toString(var$13));
                $rt_throw(var$11);
            }
            if ($digit >= $radix) {
                var$12 = new jl_NumberFormatException;
                var$13 = jl_String_valueOf($s.$subSequence($beginIndex, $endIndex));
                var$14 = jl_StringBuilder__init_();
                jl_StringBuilder_append(jl_StringBuilder_append(jl_StringBuilder_append0(jl_StringBuilder_append(var$14, $rt_s(3)), $radix), $rt_s(4)), var$13);
                jl_NumberFormatException__init_(var$12, jl_StringBuilder_toString(var$14));
                $rt_throw(var$12);
            }
            if ($value > $maxValue)
                break;
            $value = $rt_imul($radix, $value) + $digit | 0;
            if ($value < 0) {
                if (var$9 == $endIndex && $value == (-2147483648) && $negative)
                    return (-2147483648);
                var$11 = new jl_NumberFormatException;
                var$12 = jl_String_valueOf($s.$subSequence($beginIndex, $endIndex));
                var$13 = jl_StringBuilder__init_();
                jl_StringBuilder_append(jl_StringBuilder_append(var$13, $rt_s(5)), var$12);
                jl_NumberFormatException__init_(var$11, jl_StringBuilder_toString(var$13));
                $rt_throw(var$11);
            }
            var$6 = var$9;
        }
        $rt_throw(jl_NumberFormatException__init_0($rt_s(6)));
    }
    var$11 = new jl_NumberFormatException;
    var$12 = jl_StringBuilder__init_();
    jl_StringBuilder_append0(jl_StringBuilder_append(var$12, $rt_s(7)), $radix);
    jl_NumberFormatException__init_(var$11, jl_StringBuilder_toString(var$12));
    $rt_throw(var$11);
},
jl_Integer_parseInt = $s => {
    jl_Integer_$callClinit();
    return jl_Integer_parseInt0($s, 10);
},
jl_Integer_valueOf = $i => {
    jl_Integer_$callClinit();
    if ($i >= (-128) && $i <= 127) {
        jl_Integer_ensureIntegerCache();
        return jl_Integer_integerCache.data[$i + 128 | 0];
    }
    return jl_Integer__init_0($i);
},
jl_Integer_ensureIntegerCache = () => {
    let $j;
    jl_Integer_$callClinit();
    a: {
        if (jl_Integer_integerCache === null) {
            jl_Integer_integerCache = $rt_createArray(jl_Integer, 256);
            $j = 0;
            while (true) {
                if ($j >= jl_Integer_integerCache.data.length)
                    break a;
                jl_Integer_integerCache.data[$j] = jl_Integer__init_0($j - 128 | 0);
                $j = $j + 1 | 0;
            }
        }
    }
},
jl_Integer_intValue = $this => {
    return $this.$value1;
},
jl_Integer_equals = ($this, $other) => {
    if ($this === $other)
        return 1;
    return $other instanceof jl_Integer && $other.$value1 == $this.$value1 ? 1 : 0;
},
jl_Integer_decodeDigit = $c => {
    jl_Integer_$callClinit();
    if ($c >= 48 && $c <= 57)
        return $c - 48 | 0;
    if ($c >= 97 && $c <= 122)
        return ($c - 97 | 0) + 10 | 0;
    if ($c >= 65 && $c <= 90)
        return ($c - 65 | 0) + 10 | 0;
    return (-1);
},
jl_Integer_numberOfLeadingZeros = $i => {
    let $n, var$3, var$4;
    jl_Integer_$callClinit();
    if (!$i)
        return 32;
    $n = 0;
    var$3 = $i >>> 16 | 0;
    if (var$3)
        $n = 16;
    else
        var$3 = $i;
    var$4 = var$3 >>> 8 | 0;
    if (!var$4)
        var$4 = var$3;
    else
        $n = $n | 8;
    var$3 = var$4 >>> 4 | 0;
    if (!var$3)
        var$3 = var$4;
    else
        $n = $n | 4;
    var$4 = var$3 >>> 2 | 0;
    if (!var$4)
        var$4 = var$3;
    else
        $n = $n | 2;
    if (var$4 >>> 1 | 0)
        $n = $n | 1;
    return (32 - $n | 0) - 1 | 0;
},
jl_Integer__clinit_ = () => {
    jl_Integer_TYPE = $rt_cls($rt_intcls);
},
i_ImageIO$Callback = $rt_classWithoutFields(0);
function i_ImageIO$preload$lambda$_5_0() {
    let a = this; jl_Object.call(a);
    a.$_013 = null;
    a.$_13 = null;
}
let i_ImageIO$preload$lambda$_5_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_013 = var$1;
    var$0.$_13 = var$2;
},
i_ImageIO$preload$lambda$_5_0__init_0 = (var_0, var_1) => {
    let var_2 = new i_ImageIO$preload$lambda$_5_0();
    i_ImageIO$preload$lambda$_5_0__init_(var_2, var_0, var_1);
    return var_2;
},
i_ImageIO$preload$lambda$_5_0_call = var$0 => {
    i_ImageIO_lambda$preload$0(var$0.$_013, var$0.$_13);
},
i_ImageIO$preload$lambda$_5_0_call$exported$0 = var$1 => {
    var$1.$call();
},
n_WebSocket$StringHandler = $rt_classWithoutFields(0);
function n_BrowserWebSocket$_init_$lambda$_0_1() {
    let a = this; jl_Object.call(a);
    a.$_02 = null;
    a.$_10 = null;
}
let n_BrowserWebSocket$_init_$lambda$_0_1__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_02 = var$1;
    var$0.$_10 = var$2;
},
n_BrowserWebSocket$_init_$lambda$_0_1__init_0 = (var_0, var_1) => {
    let var_2 = new n_BrowserWebSocket$_init_$lambda$_0_1();
    n_BrowserWebSocket$_init_$lambda$_0_1__init_(var_2, var_0, var_1);
    return var_2;
},
n_BrowserWebSocket$_init_$lambda$_0_1_handle = (var$0, var$1) => {
    n_BrowserWebSocket_lambda$new$1(var$0.$_02, var$0.$_10, var$1);
},
n_BrowserWebSocket$_init_$lambda$_0_1_handle$exported$0 = (var$1, var$2) => {
    var$2 = $rt_str(var$2);
    var$1.$handle(var$2);
},
jl_AbstractStringBuilder$Constants = $rt_classWithoutFields(),
jl_AbstractStringBuilder$Constants_longLogPowersOfTen = null,
jl_AbstractStringBuilder$Constants_doubleAnalysisResult = null,
jl_AbstractStringBuilder$Constants_floatAnalysisResult = null,
jl_AbstractStringBuilder$Constants_$callClinit = () => {
    jl_AbstractStringBuilder$Constants_$callClinit = $rt_eraseClinit(jl_AbstractStringBuilder$Constants);
    jl_AbstractStringBuilder$Constants__clinit_();
},
jl_AbstractStringBuilder$Constants__clinit_ = () => {
    jl_AbstractStringBuilder$Constants_longLogPowersOfTen = $rt_createLongArrayFromData([Long_fromInt(1), Long_fromInt(10), Long_fromInt(100), Long_fromInt(10000), Long_fromInt(100000000), Long_create(1874919424, 2328306)]);
    jl_AbstractStringBuilder$Constants_doubleAnalysisResult = otcit_DoubleAnalyzer$Result__init_();
    jl_AbstractStringBuilder$Constants_floatAnalysisResult = otcit_FloatAnalyzer$Result__init_0();
},
n_WebSocket$CloseHandler = $rt_classWithoutFields(0);
function n_BrowserWebSocket$_init_$lambda$_0_2() {
    let a = this; jl_Object.call(a);
    a.$_014 = null;
    a.$_15 = null;
}
let n_BrowserWebSocket$_init_$lambda$_0_2__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_014 = var$1;
    var$0.$_15 = var$2;
},
n_BrowserWebSocket$_init_$lambda$_0_2__init_0 = (var_0, var_1) => {
    let var_2 = new n_BrowserWebSocket$_init_$lambda$_0_2();
    n_BrowserWebSocket$_init_$lambda$_0_2__init_(var_2, var_0, var_1);
    return var_2;
},
n_BrowserWebSocket$_init_$lambda$_0_2_handle = (var$0, var$1, var$2) => {
    n_BrowserWebSocket_lambda$new$2(var$0.$_014, var$0.$_15, var$1, var$2);
},
n_BrowserWebSocket$_init_$lambda$_0_2_handle$exported$0 = (var$1, var$2, var$3) => {
    let var$4;
    var$4 = var$2;
    var$2 = $rt_str(var$3);
    var$1.$handle0(var$4, var$2);
},
n_WebSocket$VoidHandler = $rt_classWithoutFields(0);
function n_BrowserWebSocket$_init_$lambda$_0_0() {
    let a = this; jl_Object.call(a);
    a.$_035 = null;
    a.$_19 = null;
    a.$_20 = null;
}
let n_BrowserWebSocket$_init_$lambda$_0_0__init_ = (var$0, var$1, var$2, var$3) => {
    jl_Object__init_(var$0);
    var$0.$_035 = var$1;
    var$0.$_19 = var$2;
    var$0.$_20 = var$3;
},
n_BrowserWebSocket$_init_$lambda$_0_0__init_0 = (var_0, var_1, var_2) => {
    let var_3 = new n_BrowserWebSocket$_init_$lambda$_0_0();
    n_BrowserWebSocket$_init_$lambda$_0_0__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
n_BrowserWebSocket$_init_$lambda$_0_0_handle = var$0 => {
    n_BrowserWebSocket_lambda$new$0(var$0.$_035, var$0.$_19, var$0.$_20);
},
n_BrowserWebSocket$_init_$lambda$_0_0_handle$exported$0 = var$1 => {
    var$1.$handle1();
},
jl_Long = $rt_classWithoutFields(jl_Number),
jl_Long_TYPE = null,
jl_Long_$callClinit = () => {
    jl_Long_$callClinit = $rt_eraseClinit(jl_Long);
    jl_Long__clinit_();
},
jl_Long_divideUnsigned = (var$1, var$2) => {
    return Long_udiv(var$1, var$2);
},
jl_Long_compareUnsigned = (var$1, var$2) => {
    return Long_ucompare(var$1, var$2);
},
jl_Long__clinit_ = () => {
    jl_Long_TYPE = $rt_cls($rt_longcls);
};
function n_BrowserWebSocket$_init_$lambda$_0_3() {
    let a = this; jl_Object.call(a);
    a.$_027 = null;
    a.$_18 = null;
    a.$_2 = null;
}
let n_BrowserWebSocket$_init_$lambda$_0_3__init_ = (var$0, var$1, var$2, var$3) => {
    jl_Object__init_(var$0);
    var$0.$_027 = var$1;
    var$0.$_18 = var$2;
    var$0.$_2 = var$3;
},
n_BrowserWebSocket$_init_$lambda$_0_3__init_0 = (var_0, var_1, var_2) => {
    let var_3 = new n_BrowserWebSocket$_init_$lambda$_0_3();
    n_BrowserWebSocket$_init_$lambda$_0_3__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
n_BrowserWebSocket$_init_$lambda$_0_3_handle = var$0 => {
    n_BrowserWebSocket_lambda$new$3(var$0.$_027, var$0.$_18, var$0.$_2);
},
n_BrowserWebSocket$_init_$lambda$_0_3_handle$exported$0 = var$1 => {
    var$1.$handle1();
},
ju_Map = $rt_classWithoutFields(0),
juc_Callable = $rt_classWithoutFields(0),
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0 = $rt_classWithoutFields(),
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0();
    d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0_call0 = var$0 => {
    return d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0_call(var$0);
},
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0_call = var$0 => {
    return d_ConcurrencyTest_lambda$submitRunsAndCompletes$13();
},
ae_MouseListener = $rt_classWithoutFields(0),
ae_MouseMotionListener = $rt_classWithoutFields(0),
ae_MouseWheelListener = $rt_classWithoutFields(0),
ae_MouseAdapter = $rt_classWithoutFields(),
ae_MouseAdapter__init_ = $this => {
    jl_Object__init_($this);
},
ae_MouseAdapter_mouseClicked = ($this, $e) => {
    return;
},
ae_MouseAdapter_mousePressed = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseReleased = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseEntered = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseExited = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseMoved = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseDragged = ($this, $e) => {
    return;
},
ae_MouseAdapter_mouseWheelMoved = ($this, $e) => {
    return;
};
function d_InteractivePanel$2() {
    ae_MouseAdapter.call(this);
    this.$this$00 = null;
}
let d_InteractivePanel$2__init_ = ($this, $this$0) => {
    $this.$this$00 = $this$0;
    ae_MouseAdapter__init_($this);
},
d_InteractivePanel$2__init_0 = var_0 => {
    let var_1 = new d_InteractivePanel$2();
    d_InteractivePanel$2__init_(var_1, var_0);
    return var_1;
},
d_InteractivePanel$2_mouseClicked = ($this, $e) => {
    let $hit, var$3, var$4, var$5, var$6, var$7;
    if ($this.$this$00.$card === null)
        return;
    $hit = $this.$this$00.$card.$handleClick($e.$getX(), $e.$getY());
    var$3 = $this.$this$00;
    var$3.$clicks = var$3.$clicks + 1 | 0;
    var$3 = $this.$this$00;
    if ($hit) {
        var$4 = $this.$this$00.$clicks;
        var$5 = jl_StringBuilder__init_();
        jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append(var$5, $rt_s(8)), var$4), 41);
        var$5 = jl_StringBuilder_toString(var$5);
    } else {
        var$4 = $e.$getX();
        var$6 = $e.$getY();
        var$7 = jl_StringBuilder__init_();
        jl_StringBuilder_append(jl_StringBuilder_append0(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append(var$7, $rt_s(9)), var$4), 44), var$6), $rt_s(10));
        var$5 = jl_StringBuilder_toString(var$7);
    }
    var$3.$status = var$5;
    $this.$this$00.$repaint();
},
d_InteractivePanel$2_mouseExited = ($this, $e) => {
    let var$2;
    var$2 = $this.$this$00;
    $this.$this$00.$mouseY = (-1);
    var$2.$mouseX = (-1);
    if ($this.$this$00.$card !== null)
        $this.$this$00.$card.$handleMouseMove((-1), (-1));
    $this.$this$00.$repaint();
};
function d_InteractivePanel$1() {
    ae_MouseAdapter.call(this);
    this.$this$01 = null;
}
let d_InteractivePanel$1__init_ = ($this, $this$0) => {
    $this.$this$01 = $this$0;
    ae_MouseAdapter__init_($this);
},
d_InteractivePanel$1__init_0 = var_0 => {
    let var_1 = new d_InteractivePanel$1();
    d_InteractivePanel$1__init_(var_1, var_0);
    return var_1;
},
d_InteractivePanel$1_mouseMoved = ($this, $e) => {
    $this.$this$01.$mouseX = $e.$getX();
    $this.$this$01.$mouseY = $e.$getY();
    if ($this.$this$01.$card !== null)
        $this.$this$01.$card.$handleMouseMove($this.$this$01.$mouseX, $this.$this$01.$mouseY);
    $this.$this$01.$repaint();
},
a_Paint = $rt_classWithoutFields(0);
function a_Color() {
    let a = this; jl_Object.call(a);
    a.$r = 0;
    a.$g = 0;
    a.$b = 0;
    a.$a = 0;
}
let a_Color_WHITE = null,
a_Color_BLACK = null,
a_Color_$callClinit = () => {
    a_Color_$callClinit = $rt_eraseClinit(a_Color);
    a_Color__clinit_();
},
a_Color__init_2 = ($this, $r, $g, $b) => {
    a_Color_$callClinit();
    a_Color__init_0($this, $r, $g, $b, 255);
},
a_Color__init_ = (var_0, var_1, var_2) => {
    let var_3 = new a_Color();
    a_Color__init_2(var_3, var_0, var_1, var_2);
    return var_3;
},
a_Color__init_0 = ($this, $r, $g, $b, $a) => {
    a_Color_$callClinit();
    jl_Object__init_($this);
    $this.$r = $r;
    $this.$g = $g;
    $this.$b = $b;
    $this.$a = $a;
},
a_Color__init_1 = (var_0, var_1, var_2, var_3) => {
    let var_4 = new a_Color();
    a_Color__init_0(var_4, var_0, var_1, var_2, var_3);
    return var_4;
},
a_Color_clamp = $v => {
    a_Color_$callClinit();
    if ($v < 0)
        $v = 0;
    else if ($v > 255)
        $v = 255;
    return $v;
},
a_Color_brighter = $this => {
    let $i, $nr, $ng, $nb;
    $i = 3;
    if (!$this.$r && !$this.$g && !$this.$b)
        return a_Color__init_1($i, $i, $i, $this.$a);
    $nr = $this.$r;
    $ng = $this.$g;
    $nb = $this.$b;
    if ($nr > 0 && $nr < $i)
        $nr = $i;
    if ($ng > 0 && $ng < $i)
        $ng = $i;
    if ($nb <= 0)
        $i = $nb;
    else if ($nb >= $i)
        $i = $nb;
    return a_Color__init_1(a_Color_clamp($nr / 0.7 | 0), a_Color_clamp($ng / 0.7 | 0), a_Color_clamp($i / 0.7 | 0), $this.$a);
},
a_Color_toCss = $this => {
    let var$1, var$2, var$3, var$4, var$5;
    if ($this.$a == 255) {
        var$1 = $this.$r;
        var$2 = $this.$g;
        var$3 = $this.$b;
        var$4 = jl_StringBuilder__init_();
        jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append(var$4, $rt_s(11)), var$1), 44), var$2), 44), var$3), 41);
        return jl_StringBuilder_toString(var$4);
    }
    var$1 = $this.$r;
    var$2 = $this.$g;
    var$3 = $this.$b;
    var$5 = $this.$a / 255.0;
    var$4 = jl_StringBuilder__init_();
    jl_StringBuilder_append1(jl_StringBuilder_append3(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append(var$4, $rt_s(12)), var$1), 44), var$2), 44), var$3), 44), var$5), 41);
    return jl_StringBuilder_toString(var$4);
},
a_Color__clinit_ = () => {
    a_Color_WHITE = a_Color__init_(255, 255, 255);
    a_Color_BLACK = a_Color__init_(0, 0, 0);
},
ae_KeyListener = $rt_classWithoutFields(0),
ae_KeyAdapter = $rt_classWithoutFields(),
ae_KeyAdapter__init_ = $this => {
    jl_Object__init_($this);
},
ae_KeyAdapter_keyTyped = ($this, $e) => {
    return;
},
ae_KeyAdapter_keyReleased = ($this, $e) => {
    return;
};
function d_InteractivePanel$3() {
    ae_KeyAdapter.call(this);
    this.$this$02 = null;
}
let d_InteractivePanel$3__init_ = ($this, $this$0) => {
    $this.$this$02 = $this$0;
    ae_KeyAdapter__init_($this);
},
d_InteractivePanel$3__init_0 = var_0 => {
    let var_1 = new d_InteractivePanel$3();
    d_InteractivePanel$3__init_(var_1, var_0);
    return var_1;
},
d_InteractivePanel$3_keyPressed = ($this, $e) => {
    let var$2, var$3, var$4, var$5;
    if ($this.$this$02.$card === null)
        return;
    if ($e.$getKeyCode() == 32) {
        $this.$this$02.$card.$toggle();
        var$2 = $this.$this$02;
        var$3 = $this.$this$02.$card.$isVisible();
        var$4 = jl_StringBuilder__init_();
        jl_StringBuilder_append2(jl_StringBuilder_append(var$4, $rt_s(13)), var$3);
        var$2.$status = jl_StringBuilder_toString(var$4);
    } else if ($e.$getKeyChar() != 65535) {
        var$2 = $this.$this$02;
        var$3 = $e.$getKeyChar();
        var$5 = $e.$getKeyCode();
        var$4 = jl_StringBuilder__init_();
        jl_StringBuilder_append0(jl_StringBuilder_append(jl_StringBuilder_append1(jl_StringBuilder_append(var$4, $rt_s(14)), var$3), $rt_s(15)), var$5);
        var$2.$status = jl_StringBuilder_toString(var$4);
    }
    $this.$this$02.$repaint();
},
c_Future = $rt_classWithoutFields(0),
c_CompletionStage = $rt_classWithoutFields(0);
function c_CompletableFuture() {
    let a = this; jl_Object.call(a);
    a.$value0 = null;
    a.$failure = null;
    a.$done = 0;
    a.$callbacks = null;
}
let c_CompletableFuture__init_0 = $this => {
    jl_Object__init_($this);
    $this.$callbacks = ju_ArrayList__init_();
},
c_CompletableFuture__init_ = () => {
    let var_0 = new c_CompletableFuture();
    c_CompletableFuture__init_0(var_0);
    return var_0;
},
c_CompletableFuture_completedFuture = $value => {
    let $f;
    $f = c_CompletableFuture__init_();
    $f.$complete($value);
    return $f;
},
c_CompletableFuture_supplyAsync = $supplier => {
    let $f;
    $f = c_CompletableFuture__init_();
    c_EventLoop_defer$js_body$_1(otji_JS_function(otji_JSWrapper_unwrap(c_CompletableFuture$supplyAsync$lambda$_2_0__init_0($f, $supplier)), "run"));
    return $f;
},
c_CompletableFuture_complete = ($this, $v) => {
    if ($this.$done)
        return 0;
    $this.$value0 = $v;
    $this.$done = 1;
    c_CompletableFuture_fire($this);
    return 1;
},
c_CompletableFuture_completeExceptionally = ($this, $t) => {
    if ($this.$done)
        return 0;
    $this.$failure = $t;
    $this.$done = 1;
    c_CompletableFuture_fire($this);
    return 1;
},
c_CompletableFuture_fire = $this => {
    let var$1, $cb;
    var$1 = $this.$callbacks.$iterator();
    while (var$1.$hasNext()) {
        $cb = var$1.$next();
        $cb.$accept($this.$value0, $this.$failure);
    }
    $this.$callbacks.$clear();
},
c_CompletableFuture_onDone = ($this, $cb) => {
    if (!$this.$done)
        $this.$callbacks.$add($cb);
    else
        $cb.$accept($this.$value0, $this.$failure);
},
c_CompletableFuture_whenComplete = ($this, $action) => {
    let $next;
    $next = c_CompletableFuture__init_();
    c_CompletableFuture_onDone($this, c_CompletableFuture$whenComplete$lambda$_8_0__init_0($action, $next));
    return $next;
},
c_CompletableFuture_thenApply = ($this, $fn) => {
    let $next;
    $next = c_CompletableFuture__init_();
    c_CompletableFuture_onDone($this, c_CompletableFuture$thenApply$lambda$_9_0__init_0($next, $fn));
    return $next;
},
c_CompletableFuture_thenAccept = ($this, $action) => {
    return $this.$thenApply(c_CompletableFuture$thenAccept$lambda$_10_0__init_0($action));
},
c_CompletableFuture_thenRun = ($this, $action) => {
    return $this.$thenApply(c_CompletableFuture$thenRun$lambda$_11_0__init_0($action));
},
c_CompletableFuture_exceptionally = ($this, $fn) => {
    let $next;
    $next = c_CompletableFuture__init_();
    c_CompletableFuture_onDone($this, c_CompletableFuture$exceptionally$lambda$_13_0__init_0($next, $fn));
    return $next;
},
c_CompletableFuture_join = $this => {
    if (!$this.$done)
        $rt_throw(jl_IllegalStateException__init_($rt_s(16)));
    if ($this.$failure === null)
        return $this.$value0;
    $rt_throw(c_ExecutorService_wrap($this.$failure));
},
c_CompletableFuture_isDone = $this => {
    return $this.$done;
},
c_CompletableFuture_isCompletedExceptionally = $this => {
    return $this.$done && $this.$failure !== null ? 1 : 0;
},
c_CompletableFuture_lambda$exceptionally$8 = ($next, $fn, $v, $t) => {
    if ($t === null)
        $next.$complete($v);
    else
        $next.$complete($fn.$apply($t));
},
c_CompletableFuture_lambda$thenRun$5 = ($action, $v) => {
    $action.$run();
    return null;
},
c_CompletableFuture_lambda$thenAccept$4 = ($action, $v) => {
    $action.$accept0($v);
    return null;
},
c_CompletableFuture_lambda$thenApply$3 = ($next, $fn, $v, $t) => {
    let $e, $$je;
    if ($t !== null) {
        $next.$completeExceptionally($t);
        return;
    }
    a: {
        try {
            $next.$complete($fn.$apply($v));
            break a;
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_RuntimeException) {
                $e = $$je;
                $next.$completeExceptionally($e);
                break a;
            } else {
                throw $$e;
            }
        }
    }
},
c_CompletableFuture_lambda$whenComplete$2 = ($action, $next, $v, $t) => {
    $action.$accept($v, $t);
    if ($t === null)
        $next.$complete($v);
    else
        $next.$completeExceptionally($t);
},
c_CompletableFuture_lambda$supplyAsync$0 = ($f, $supplier) => {
    let $e, $$je;
    a: {
        try {
            $f.$complete($supplier.$get());
            break a;
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_RuntimeException) {
                $e = $$je;
                $f.$completeExceptionally($e);
                break a;
            } else {
                throw $$e;
            }
        }
    }
};
function c_ScheduledExecutorService$repeating$lambda$_5_0() {
    let a = this; jl_Object.call(a);
    a.$_016 = null;
    a.$_16 = Long_ZERO;
}
let c_ScheduledExecutorService$repeating$lambda$_5_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_016 = var$1;
    var$0.$_16 = var$2;
},
c_ScheduledExecutorService$repeating$lambda$_5_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_ScheduledExecutorService$repeating$lambda$_5_0();
    c_ScheduledExecutorService$repeating$lambda$_5_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_ScheduledExecutorService$repeating$lambda$_5_0_run = var$0 => {
    c_ScheduledExecutorService_lambda$repeating$2(var$0.$_016, var$0.$_16);
},
c_ScheduledExecutorService$repeating$lambda$_5_0_run$exported$0 = var$1 => {
    var$1.$run();
},
jl_CharSequence = $rt_classWithoutFields(0),
jl_StringIndexOutOfBoundsException = $rt_classWithoutFields(jl_IndexOutOfBoundsException),
jl_StringIndexOutOfBoundsException__init_0 = $this => {
    jl_IndexOutOfBoundsException__init_($this);
},
jl_StringIndexOutOfBoundsException__init_ = () => {
    let var_0 = new jl_StringIndexOutOfBoundsException();
    jl_StringIndexOutOfBoundsException__init_0(var_0);
    return var_0;
},
ae_FocusListener = $rt_classWithoutFields(0),
otci_Base46 = $rt_classWithoutFields(),
otci_Base46_decodeUnsigned = $seq => {
    let $number, $pos, var$4, var$5, $digit, $hasMore;
    $number = 0;
    $pos = 1;
    while (true) {
        var$4 = $seq.$characters.data;
        var$5 = $seq.$pointer;
        $seq.$pointer = var$5 + 1 | 0;
        $digit = otci_Base46_decodeDigit(var$4[var$5]);
        $hasMore = ($digit % 2 | 0) != 1 ? 0 : 1;
        $number = $number + $rt_imul($pos, $digit / 2 | 0) | 0;
        $pos = $pos * 46 | 0;
        if (!$hasMore)
            break;
    }
    return $number;
},
otci_Base46_decode = $seq => {
    let $number, $result;
    $number = otci_Base46_decodeUnsigned($seq);
    $result = $number / 2 | 0;
    if ($number % 2 | 0)
        $result =  -$result | 0;
    return $result;
},
otci_Base46_decodeDigit = $c => {
    if ($c < 34)
        return $c - 32 | 0;
    if ($c >= 92)
        return ($c - 32 | 0) - 2 | 0;
    return ($c - 32 | 0) - 1 | 0;
},
ju_Comparator = $rt_classWithoutFields(0),
jl_String$_clinit_$lambda$_118_0 = $rt_classWithoutFields(),
jl_String$_clinit_$lambda$_118_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
jl_String$_clinit_$lambda$_118_0__init_0 = () => {
    let var_0 = new jl_String$_clinit_$lambda$_118_0();
    jl_String$_clinit_$lambda$_118_0__init_(var_0);
    return var_0;
};
function jl_AbstractStringBuilder() {
    let a = this; jl_Object.call(a);
    a.$buffer = null;
    a.$length0 = 0;
}
let jl_AbstractStringBuilder__init_0 = $this => {
    jl_AbstractStringBuilder__init_($this, 16);
},
jl_AbstractStringBuilder__init_5 = () => {
    let var_0 = new jl_AbstractStringBuilder();
    jl_AbstractStringBuilder__init_0(var_0);
    return var_0;
},
jl_AbstractStringBuilder__init_ = ($this, $capacity) => {
    jl_Object__init_($this);
    $this.$buffer = $rt_createCharArray($capacity);
},
jl_AbstractStringBuilder__init_6 = var_0 => {
    let var_1 = new jl_AbstractStringBuilder();
    jl_AbstractStringBuilder__init_(var_1, var_0);
    return var_1;
},
jl_AbstractStringBuilder__init_2 = ($this, $value) => {
    jl_AbstractStringBuilder__init_1($this, $value);
},
jl_AbstractStringBuilder__init_4 = var_0 => {
    let var_1 = new jl_AbstractStringBuilder();
    jl_AbstractStringBuilder__init_2(var_1, var_0);
    return var_1;
},
jl_AbstractStringBuilder__init_1 = ($this, $value) => {
    let $i;
    jl_Object__init_($this);
    $this.$buffer = $rt_createCharArray($value.$length());
    $i = 0;
    while ($i < $this.$buffer.data.length) {
        $this.$buffer.data[$i] = $value.$charAt($i);
        $i = $i + 1 | 0;
    }
    $this.$length0 = $value.$length();
},
jl_AbstractStringBuilder__init_3 = var_0 => {
    let var_1 = new jl_AbstractStringBuilder();
    jl_AbstractStringBuilder__init_1(var_1, var_0);
    return var_1;
},
jl_AbstractStringBuilder_append3 = ($this, $obj) => {
    return $this.$insert($this.$length0, $obj);
},
jl_AbstractStringBuilder_append = ($this, $string) => {
    return $this.$insert0($this.$length0, $string);
},
jl_AbstractStringBuilder_insert1 = ($this, $index, $string) => {
    let $i, var$4, var$5;
    if ($index >= 0 && $index <= $this.$length0) {
        if ($string === null)
            $string = $rt_s(17);
        else if (jl_String_isEmpty($string))
            return $this;
        $this.$ensureCapacity($this.$length0 + jl_String_length($string) | 0);
        $i = $this.$length0 - 1 | 0;
        while ($i >= $index) {
            $this.$buffer.data[$i + jl_String_length($string) | 0] = $this.$buffer.data[$i];
            $i = $i + (-1) | 0;
        }
        $this.$length0 = $this.$length0 + jl_String_length($string) | 0;
        $i = 0;
        while ($i < jl_String_length($string)) {
            var$4 = $this.$buffer.data;
            var$5 = $index + 1 | 0;
            var$4[$index] = jl_String_charAt($string, $i);
            $i = $i + 1 | 0;
            $index = var$5;
        }
        return $this;
    }
    $rt_throw(jl_StringIndexOutOfBoundsException__init_());
},
jl_AbstractStringBuilder_append0 = ($this, $value) => {
    return $this.$append4($value, 10);
},
jl_AbstractStringBuilder_append5 = ($this, $value, $radix) => {
    return $this.$insert1($this.$length0, $value, $radix);
},
jl_AbstractStringBuilder_insert4 = ($this, $target, $value, $radix) => {
    let $positive, var$5, var$6, $pos, $sz, $posLimit, var$10, var$11;
    $positive = 1;
    if ($value < 0) {
        $positive = 0;
        $value =  -$value | 0;
    }
    a: {
        if ($rt_ucmp($value, $radix) < 0) {
            if ($positive)
                jl_AbstractStringBuilder_insertSpace($this, $target, $target + 1 | 0);
            else {
                jl_AbstractStringBuilder_insertSpace($this, $target, $target + 2 | 0);
                var$5 = $this.$buffer.data;
                var$6 = $target + 1 | 0;
                var$5[$target] = 45;
                $target = var$6;
            }
            $this.$buffer.data[$target] = jl_Character_forDigit($value, $radix);
        } else {
            $pos = 1;
            $sz = 1;
            $posLimit = $rt_udiv((-1), $radix);
            b: {
                while (true) {
                    var$10 = $rt_imul($pos, $radix);
                    if ($rt_ucmp(var$10, $value) > 0) {
                        var$10 = $pos;
                        break b;
                    }
                    $sz = $sz + 1 | 0;
                    if ($rt_ucmp(var$10, $posLimit) > 0)
                        break;
                    $pos = var$10;
                }
            }
            if (!$positive)
                $sz = $sz + 1 | 0;
            jl_AbstractStringBuilder_insertSpace($this, $target, $target + $sz | 0);
            if ($positive)
                var$11 = $target;
            else {
                var$5 = $this.$buffer.data;
                var$11 = $target + 1 | 0;
                var$5[$target] = 45;
            }
            while (true) {
                if (!var$10)
                    break a;
                var$5 = $this.$buffer.data;
                var$6 = var$11 + 1 | 0;
                var$5[var$11] = jl_Character_forDigit($rt_udiv($value, var$10), $radix);
                $value = $rt_umod($value, var$10);
                var$10 = $rt_udiv(var$10, $radix);
                var$11 = var$6;
            }
        }
    }
    return $this;
},
jl_AbstractStringBuilder_append2 = ($this, $value) => {
    return $this.$insert2($this.$length0, $value);
},
jl_AbstractStringBuilder_insert0 = ($this, $target, $value) => {
    let var$3, var$4, var$5, $number, $mantissa, $exp, $negative, $intPart, $sz, $digits, $zeros, $leadingZeros, $leadingZero, var$16, $pos, $i, $intDigit, var$20;
    var$3 = $rt_compare_less($value, 0.0);
    if (!var$3) {
        if (1.0 / $value === Infinity) {
            jl_AbstractStringBuilder_insertSpace($this, $target, $target + 3 | 0);
            var$4 = $this.$buffer.data;
            var$3 = $target + 1 | 0;
            var$4[$target] = 48;
            var$4 = $this.$buffer.data;
            var$5 = var$3 + 1 | 0;
            var$4[var$3] = 46;
            $this.$buffer.data[var$5] = 48;
            return $this;
        }
        jl_AbstractStringBuilder_insertSpace($this, $target, $target + 4 | 0);
        var$4 = $this.$buffer.data;
        var$3 = $target + 1 | 0;
        var$4[$target] = 45;
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 48;
        var$4 = $this.$buffer.data;
        var$3 = var$5 + 1 | 0;
        var$4[var$5] = 46;
        $this.$buffer.data[var$3] = 48;
        return $this;
    }
    if (isNaN($value) ? 1 : 0) {
        jl_AbstractStringBuilder_insertSpace($this, $target, $target + 3 | 0);
        var$4 = $this.$buffer.data;
        var$3 = $target + 1 | 0;
        var$4[$target] = 78;
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 97;
        $this.$buffer.data[var$5] = 78;
        return $this;
    }
    if (jl_Double_isInfinite($value)) {
        if (var$3 > 0) {
            jl_AbstractStringBuilder_insertSpace($this, $target, $target + 8 | 0);
            var$3 = $target;
        } else {
            jl_AbstractStringBuilder_insertSpace($this, $target, $target + 9 | 0);
            var$4 = $this.$buffer.data;
            var$3 = $target + 1 | 0;
            var$4[$target] = 45;
        }
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 73;
        var$4 = $this.$buffer.data;
        var$3 = var$5 + 1 | 0;
        var$4[var$5] = 110;
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 102;
        var$4 = $this.$buffer.data;
        var$3 = var$5 + 1 | 0;
        var$4[var$5] = 105;
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 110;
        var$4 = $this.$buffer.data;
        var$3 = var$5 + 1 | 0;
        var$4[var$5] = 105;
        var$4 = $this.$buffer.data;
        var$5 = var$3 + 1 | 0;
        var$4[var$3] = 116;
        $this.$buffer.data[var$5] = 121;
        return $this;
    }
    jl_AbstractStringBuilder$Constants_$callClinit();
    $number = jl_AbstractStringBuilder$Constants_doubleAnalysisResult;
    otcit_DoubleAnalyzer_analyze($value, $number);
    $mantissa = $number.$mantissa;
    $exp = $number.$exponent;
    $negative = $number.$sign0;
    $intPart = 1;
    $sz = 1;
    if ($negative)
        $sz = 2;
    $digits = 18;
    $zeros = jl_AbstractStringBuilder_trailingDecimalZeros($mantissa);
    if ($zeros > 0)
        $digits = $digits - $zeros | 0;
    $leadingZeros = 0;
    $leadingZero = 0;
    if ($exp < 7 && $exp >= (-3)) {
        if ($exp >= 0) {
            $intPart = $exp + 1 | 0;
            $digits = jl_Math_max($digits, $intPart + 1 | 0);
            $exp = 0;
        } else {
            $intPart = 0;
            $leadingZeros = ( -$exp | 0) - 1 | 0;
            $leadingZero = 1;
            $sz = $sz + 1 | 0;
            $exp = 0;
        }
    }
    if ($exp) {
        $sz = $sz + 2 | 0;
        if (!($exp > (-10) && $exp < 10))
            $sz = $sz + 1 | 0;
        if (!($exp > (-100) && $exp < 100))
            $sz = $sz + 1 | 0;
        if ($exp < 0)
            $sz = $sz + 1 | 0;
    }
    if ($exp && $digits == $intPart)
        $digits = $digits + 1 | 0;
    var$3 = $sz + ($digits + $leadingZeros | 0) | 0;
    jl_AbstractStringBuilder_insertSpace($this, $target, $target + var$3 | 0);
    if (!$negative)
        var$16 = $target;
    else {
        var$4 = $this.$buffer.data;
        var$16 = $target + 1 | 0;
        var$4[$target] = 45;
    }
    $pos = Long_create(1569325056, 23283064);
    if ($leadingZero) {
        var$4 = $this.$buffer.data;
        var$3 = var$16 + 1 | 0;
        var$4[var$16] = 48;
        var$4 = $this.$buffer.data;
        var$16 = var$3 + 1 | 0;
        var$4[var$3] = 46;
        while (true) {
            var$3 = $leadingZeros + (-1) | 0;
            if ($leadingZeros <= 0)
                break;
            var$4 = $this.$buffer.data;
            var$5 = var$16 + 1 | 0;
            var$4[var$16] = 48;
            $leadingZeros = var$3;
            var$16 = var$5;
        }
    }
    $i = 0;
    while ($i < $digits) {
        if (Long_le($pos, Long_ZERO))
            $intDigit = 0;
        else {
            $intDigit = Long_lo(Long_div($mantissa, $pos));
            $mantissa = Long_rem($mantissa, $pos);
        }
        var$4 = $this.$buffer.data;
        var$3 = var$16 + 1 | 0;
        var$4[var$16] = (48 + $intDigit | 0) & 65535;
        $intPart = $intPart + (-1) | 0;
        if ($intPart)
            var$16 = var$3;
        else {
            var$4 = $this.$buffer.data;
            var$16 = var$3 + 1 | 0;
            var$4[var$3] = 46;
        }
        $pos = Long_div($pos, Long_fromInt(10));
        $i = $i + 1 | 0;
    }
    if ($exp) {
        var$4 = $this.$buffer.data;
        var$3 = var$16 + 1 | 0;
        var$4[var$16] = 69;
        if ($exp >= 0)
            var$5 = var$3;
        else {
            $exp =  -$exp | 0;
            var$4 = $this.$buffer.data;
            var$5 = var$3 + 1 | 0;
            var$4[var$3] = 45;
        }
        if ($exp >= 100) {
            var$4 = $this.$buffer.data;
            var$3 = var$5 + 1 | 0;
            var$4[var$5] = (48 + ($exp / 100 | 0) | 0) & 65535;
            $exp = $exp % 100 | 0;
            var$4 = $this.$buffer.data;
            var$20 = var$3 + 1 | 0;
            var$4[var$3] = (48 + ($exp / 10 | 0) | 0) & 65535;
        } else if ($exp < 10)
            var$20 = var$5;
        else {
            var$4 = $this.$buffer.data;
            var$20 = var$5 + 1 | 0;
            var$4[var$5] = (48 + ($exp / 10 | 0) | 0) & 65535;
        }
        $this.$buffer.data[var$20] = (48 + ($exp % 10 | 0) | 0) & 65535;
    }
    return $this;
},
jl_AbstractStringBuilder_trailingDecimalZeros = $n => {
    let $zeros, $result, $bit, $i;
    $zeros = Long_fromInt(1);
    $result = 0;
    $bit = 16;
    jl_AbstractStringBuilder$Constants_$callClinit();
    $i = jl_AbstractStringBuilder$Constants_longLogPowersOfTen.data.length - 1 | 0;
    while ($i >= 0) {
        if (Long_eq(Long_rem($n, Long_mul($zeros, jl_AbstractStringBuilder$Constants_longLogPowersOfTen.data[$i])), Long_ZERO)) {
            $result = $result | $bit;
            $zeros = Long_mul($zeros, jl_AbstractStringBuilder$Constants_longLogPowersOfTen.data[$i]);
        }
        $bit = $bit >>> 1 | 0;
        $i = $i + (-1) | 0;
    }
    return $result;
},
jl_AbstractStringBuilder_append4 = ($this, $c) => {
    return $this.$insert3($this.$length0, $c);
},
jl_AbstractStringBuilder_insert3 = ($this, $index, $c) => {
    jl_AbstractStringBuilder_insertSpace($this, $index, $index + 1 | 0);
    $this.$buffer.data[$index] = $c;
    return $this;
},
jl_AbstractStringBuilder_insert2 = ($this, $index, $obj) => {
    return $this.$insert0($index, $obj === null ? $rt_s(17) : $obj.$toString());
},
jl_AbstractStringBuilder_append1 = ($this, $b) => {
    return $this.$insert4($this.$length0, $b);
},
jl_AbstractStringBuilder_insert = ($this, $index, $b) => {
    return $this.$insert0($index, !$b ? $rt_s(18) : $rt_s(19));
},
jl_AbstractStringBuilder_ensureCapacity = ($this, $capacity) => {
    let $newLength;
    if ($this.$buffer.data.length >= $capacity)
        return;
    $newLength = $this.$buffer.data.length >= 1073741823 ? 2147483647 : jl_Math_max($capacity, jl_Math_max($this.$buffer.data.length * 2 | 0, 5));
    $this.$buffer = ju_Arrays_copyOf1($this.$buffer, $newLength);
},
jl_AbstractStringBuilder_toString = $this => {
    return jl_String__init_6($this.$buffer, 0, $this.$length0);
},
jl_AbstractStringBuilder_insertSpace = ($this, $start, $end) => {
    let $sz, $i;
    $sz = $this.$length0 - $start | 0;
    $this.$ensureCapacity(($this.$length0 + $end | 0) - $start | 0);
    $i = $sz - 1 | 0;
    while ($i >= 0) {
        $this.$buffer.data[$end + $i | 0] = $this.$buffer.data[$start + $i | 0];
        $i = $i + (-1) | 0;
    }
    $this.$length0 = $this.$length0 + ($end - $start | 0) | 0;
},
jl_Appendable = $rt_classWithoutFields(0),
jl_StringBuilder = $rt_classWithoutFields(jl_AbstractStringBuilder),
jl_StringBuilder__init_1 = $this => {
    jl_AbstractStringBuilder__init_0($this);
},
jl_StringBuilder__init_ = () => {
    let var_0 = new jl_StringBuilder();
    jl_StringBuilder__init_1(var_0);
    return var_0;
},
jl_StringBuilder__init_0 = ($this, $value) => {
    jl_AbstractStringBuilder__init_2($this, $value);
},
jl_StringBuilder__init_2 = var_0 => {
    let var_1 = new jl_StringBuilder();
    jl_StringBuilder__init_0(var_1, var_0);
    return var_1;
},
jl_StringBuilder_append = ($this, $obj) => {
    jl_AbstractStringBuilder_append3($this, $obj);
    return $this;
},
jl_StringBuilder_append4 = ($this, $string) => {
    jl_AbstractStringBuilder_append($this, $string);
    return $this;
},
jl_StringBuilder_append0 = ($this, $value) => {
    jl_AbstractStringBuilder_append0($this, $value);
    return $this;
},
jl_StringBuilder_append3 = ($this, $value) => {
    jl_AbstractStringBuilder_append2($this, $value);
    return $this;
},
jl_StringBuilder_append1 = ($this, $c) => {
    jl_AbstractStringBuilder_append4($this, $c);
    return $this;
},
jl_StringBuilder_append2 = ($this, $b) => {
    jl_AbstractStringBuilder_append1($this, $b);
    return $this;
},
jl_StringBuilder_insert4 = ($this, $target, $value) => {
    jl_AbstractStringBuilder_insert0($this, $target, $value);
    return $this;
},
jl_StringBuilder_insert5 = ($this, $index, $obj) => {
    jl_AbstractStringBuilder_insert2($this, $index, $obj);
    return $this;
},
jl_StringBuilder_insert1 = ($this, $index, $b) => {
    jl_AbstractStringBuilder_insert($this, $index, $b);
    return $this;
},
jl_StringBuilder_insert2 = ($this, $index, $c) => {
    jl_AbstractStringBuilder_insert3($this, $index, $c);
    return $this;
},
jl_StringBuilder_insert6 = ($this, $index, $string) => {
    jl_AbstractStringBuilder_insert1($this, $index, $string);
    return $this;
},
jl_StringBuilder_toString = $this => {
    return jl_AbstractStringBuilder_toString($this);
},
jl_StringBuilder_ensureCapacity = ($this, var$1) => {
    jl_AbstractStringBuilder_ensureCapacity($this, var$1);
},
jl_StringBuilder_insert7 = ($this, var$1, var$2) => {
    return $this.$insert5(var$1, var$2);
},
jl_StringBuilder_insert0 = ($this, var$1, var$2) => {
    return $this.$insert6(var$1, var$2);
},
jl_StringBuilder_insert = ($this, var$1, var$2) => {
    return $this.$insert7(var$1, var$2);
},
jl_StringBuilder_insert3 = ($this, var$1, var$2) => {
    return $this.$insert8(var$1, var$2);
},
jl_StringBuilder_insert8 = ($this, var$1, var$2) => {
    return $this.$insert9(var$1, var$2);
},
ju_ConcurrentModificationException = $rt_classWithoutFields(jl_RuntimeException);
let ju_ConcurrentModificationException__init_ = $this => {
    jl_RuntimeException__init_($this);
},
ju_ConcurrentModificationException__init_0 = () => {
    let var_0 = new ju_ConcurrentModificationException();
    ju_ConcurrentModificationException__init_(var_0);
    return var_0;
};
function vr_RoomInfoCard() {
    let a = this; jl_Object.call(a);
    a.$gp = null;
    a.$controller = null;
    a.$visible = 0;
    a.$gearBounds = null;
    a.$hoverGear = 0;
}
let vr_RoomInfoCard_CARD_BG_START = null,
vr_RoomInfoCard_CARD_BG_END = null,
vr_RoomInfoCard_GOLD_LIGHT = null,
vr_RoomInfoCard_GOLD_DARK = null,
vr_RoomInfoCard_GOLD_FLAT = null,
vr_RoomInfoCard_TEXT_WHITE = null,
vr_RoomInfoCard_TEXT_PURPLE = null,
vr_RoomInfoCard_$callClinit = () => {
    vr_RoomInfoCard_$callClinit = $rt_eraseClinit(vr_RoomInfoCard);
    vr_RoomInfoCard__clinit_();
},
vr_RoomInfoCard__init_ = ($this, $gp, $controller) => {
    vr_RoomInfoCard_$callClinit();
    jl_Object__init_($this);
    $this.$visible = 1;
    $this.$gearBounds = a_Rectangle__init_1();
    $this.$hoverGear = 0;
    if ($gp === null)
        $rt_throw(jl_IllegalArgumentException__init_0($rt_s(20)));
    if ($controller !== null) {
        $this.$gp = $gp;
        $this.$controller = $controller;
        return;
    }
    $rt_throw(jl_IllegalArgumentException__init_0($rt_s(21)));
},
vr_RoomInfoCard__init_0 = (var_0, var_1) => {
    let var_2 = new vr_RoomInfoCard();
    vr_RoomInfoCard__init_(var_2, var_0, var_1);
    return var_2;
},
vr_RoomInfoCard_draw = ($this, $g2d) => {
    let $room, $cardY, $savedComposite, $savedFont, var$6, $$je;
    if (!$this.$visible)
        return;
    $room = $this.$controller.$getCurrentRoom();
    if ($room === null)
        return;
    $cardY = vr_RoomInfoCard_bottomAnchorY($this) - 60 | 0;
    $savedComposite = $g2d.$getComposite();
    $savedFont = $g2d.$getFont();
    a: {
        try {
            vr_RoomInfoCard_drawBackgroundAndBorder($this, $g2d, $cardY);
            vr_RoomInfoCard_drawWatermark($this, $g2d, $cardY);
            vr_RoomInfoCard_drawRoomName($this, $g2d, $room, $cardY);
            vr_RoomInfoCard_drawGearIcon($this, $g2d, $room, $cardY);
            vr_RoomInfoCard_drawOwnerLine($this, $g2d, $room, $cardY);
            vr_RoomInfoCard_drawPlayerCount($this, $g2d, $room, $cardY);
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            var$6 = $$je;
            break a;

        }
        $g2d.$setComposite($savedComposite);
        $g2d.$setFont($savedFont);
        return;
    }
    $g2d.$setComposite($savedComposite);
    $g2d.$setFont($savedFont);
    $rt_throw(var$6);
},
vr_RoomInfoCard_drawBackgroundAndBorder = ($this, $g2d, $y) => {
    let $bg, var$4, var$5, $border;
    $bg = new a_GradientPaint;
    vr_RoomInfoCard_$callClinit();
    var$4 = vr_RoomInfoCard_CARD_BG_START;
    var$5 = $y + 60 | 0;
    a_GradientPaint__init_($bg, 10, $y, var$4, 245, var$5, vr_RoomInfoCard_CARD_BG_END);
    $g2d.$setPaint($bg);
    $g2d.$fillRoundRect(10, $y, 235, 60, 12, 12);
    $border = a_GradientPaint__init_1(10, $y, vr_RoomInfoCard_GOLD_LIGHT, 245, var$5, vr_RoomInfoCard_GOLD_DARK);
    $g2d.$setPaint($border);
    $g2d.$setStroke(a_BasicStroke__init_(2.5));
    $g2d.$drawRoundRect(10, $y, 235, 60, 12, 12);
},
vr_RoomInfoCard_drawWatermark = ($this, $g2d, $y) => {
    let $saveClip, $saveComposite, $cy, $i, var$7, var$8, var$9, var$10, $$je;
    $saveClip = $g2d.$getClip();
    $saveComposite = $g2d.$getComposite();
    a: {
        try {
            $g2d.$clip(ag_RoundRectangle2D$Float__init_0(10.0, $y, 235.0, 60.0, 12.0, 12.0));
            $g2d.$setComposite(a_AlphaComposite_getInstance(3, 0.03999999910593033));
            a_Color_$callClinit();
            $g2d.$setColor(a_Color_WHITE);
            $g2d.$setStroke(a_BasicStroke__init_(1.100000023841858));
            $cy = $y + 30 | 0;
            $i = 0;
            while ($i < 3) {
                var$7 = $i * 6 | 0;
                var$8 = 181 - var$7 | 0;
                var$7 = ($cy - 18 | 0) - var$7 | 0;
                var$9 = 36 + ($i * 12 | 0) | 0;
                $g2d.$drawOval(var$8, var$7, var$9, var$9);
                var$7 = $cy - 44 | 0;
                var$9 = $i * 24 | 0;
                $g2d.$drawLine(155, var$7 + var$9 | 0, 243, ($cy + 44 | 0) - var$9 | 0);
                $i = $i + 1 | 0;
            }
            $g2d.$setFont(a_Font__init_($rt_s(22), 1, 15));
            $g2d.$drawString($rt_s(23), 165, $cy + 5 | 0);
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            var$10 = $$je;
            break a;

        }
        $g2d.$setClip($saveClip);
        $g2d.$setComposite($saveComposite);
        return;
    }
    $g2d.$setClip($saveClip);
    $g2d.$setComposite($saveComposite);
    $rt_throw(var$10);
},
vr_RoomInfoCard_drawRoomName = ($this, $g2d, $room, $y) => {
    let $name;
    $g2d.$setFont(a_Font__init_($rt_s(22), 1, 12));
    vr_RoomInfoCard_$callClinit();
    $g2d.$setColor(vr_RoomInfoCard_TEXT_WHITE);
    $name = vr_RoomInfoCard_truncateToWidth($g2d, $room.$getRoomName(), 193);
    $g2d.$drawString($name, 22, $y + 18 | 0);
},
vr_RoomInfoCard_drawGearIcon = ($this, $g2d, $room, $y) => {
    let $cy, $outerRadius, $innerRadius, var$7, var$8, $hi, $lo, $gearGradient, $i, $angle, $x1, var$15, $y1, $x2, $y2, var$19;
    if (!$this.$controller.$isOwnerOfCurrentRoom()) {
        $this.$gearBounds.$setBounds(0, 0, 0, 0);
        return;
    }
    $cy = $y + 15 | 0;
    $outerRadius = 5;
    $innerRadius = 2;
    var$7 = $this.$gearBounds;
    var$8 = $cy - $outerRadius | 0;
    var$7.$setBounds(219, var$8 - 4 | 0, 18, 18);
    if (!$this.$hoverGear) {
        vr_RoomInfoCard_$callClinit();
        $hi = vr_RoomInfoCard_GOLD_LIGHT;
    } else {
        vr_RoomInfoCard_$callClinit();
        $hi = vr_RoomInfoCard_GOLD_LIGHT.$brighter();
    }
    if (!$this.$hoverGear) {
        vr_RoomInfoCard_$callClinit();
        $lo = vr_RoomInfoCard_GOLD_DARK;
    } else {
        vr_RoomInfoCard_$callClinit();
        $lo = vr_RoomInfoCard_GOLD_LIGHT;
    }
    $gearGradient = a_GradientPaint__init_1(223, var$8, $hi, 233, $cy + $outerRadius | 0, $lo);
    $g2d.$setPaint($gearGradient);
    $g2d.$setStroke(a_BasicStroke__init_(2.0));
    $i = 0;
    while ($i < 8) {
        $angle = $i * 0.7853981633974483;
        $x1 = 228.0 + jl_Math_cos($angle) * 2.0 | 0;
        var$15 = $cy;
        $y1 = var$15 + jl_Math_sin($angle) * 2.0 | 0;
        $x2 = 228.0 + jl_Math_cos($angle) * 7.0 | 0;
        $y2 = var$15 + jl_Math_sin($angle) * 7.0 | 0;
        $g2d.$drawLine($x1, $y1, $x2, $y2);
        $i = $i + 1 | 0;
    }
    $g2d.$fillOval(223, var$8, 10, 10);
    vr_RoomInfoCard_$callClinit();
    $g2d.$setColor(vr_RoomInfoCard_CARD_BG_START);
    var$19 = $cy - $innerRadius | 0;
    $g2d.$fillOval(226, var$19, 4, 4);
    $g2d.$setPaint($gearGradient);
    $g2d.$setStroke(a_BasicStroke__init_(1.5));
    $g2d.$drawOval(226, var$19, 4, 4);
},
vr_RoomInfoCard_drawOwnerLine = ($this, $g2d, $room, $y) => {
    let $iconX, $iconY, $xs, $ys, var$8, var$9, $owner;
    $iconX = 22;
    $iconY = $y + 27 | 0;
    vr_RoomInfoCard_$callClinit();
    $g2d.$setColor(vr_RoomInfoCard_GOLD_FLAT);
    $xs = $rt_createIntArrayFromData([$iconX, 24, 26, 28, 30]);
    $ys = $rt_createIntArray(5);
    var$8 = $ys.data;
    var$9 = $iconY + 7 | 0;
    var$8[0] = var$9;
    var$8[1] = $iconY;
    var$8[2] = $iconY + 5 | 0;
    var$8[3] = $iconY;
    var$8[4] = var$9;
    $g2d.$fillPolygon($xs, $ys, 5);
    $g2d.$fillRect($iconX, $iconY + 8 | 0, 8, 2);
    $g2d.$setFont(a_Font__init_($rt_s(22), 0, 10));
    $g2d.$setColor(vr_RoomInfoCard_TEXT_WHITE);
    $owner = vr_RoomInfoCard_truncateToWidth($g2d, $room.$getOwnerUsername(), 199);
    $g2d.$drawString($owner, 35, $y + 35 | 0);
},
vr_RoomInfoCard_drawPlayerCount = ($this, $g2d, $room, $y) => {
    let $iconY, var$5, var$6, var$7;
    $iconY = $y + 42 | 0;
    vr_RoomInfoCard_$callClinit();
    $g2d.$setColor(vr_RoomInfoCard_TEXT_PURPLE);
    $g2d.$fillOval(24, $iconY, 5, 5);
    $g2d.$fillRoundRect(22, $iconY + 6 | 0, 9, 5, 5, 5);
    $g2d.$setFont(a_Font__init_($rt_s(22), 0, 10));
    var$5 = $room.$getCurrentPlayerCount();
    var$6 = $room.$getMaxPlayers();
    var$7 = jl_StringBuilder__init_();
    jl_StringBuilder_append0(jl_StringBuilder_append(jl_StringBuilder_append0(var$7, var$5), $rt_s(24)), var$6);
    $g2d.$drawString(jl_StringBuilder_toString(var$7), 35, $y + 50 | 0);
},
vr_RoomInfoCard_truncateToWidth = ($g2d, $text, $maxWidth) => {
    let $fm, $ellipsisW, $sb, $w, $i, $cw;
    vr_RoomInfoCard_$callClinit();
    if ($text === null)
        return $rt_s(25);
    $fm = $g2d.$getFontMetrics();
    if ($fm.$stringWidth($text) <= $maxWidth)
        return $text;
    $ellipsisW = $fm.$stringWidth($rt_s(26));
    $sb = jl_StringBuilder__init_();
    $w = 0;
    $i = 0;
    a: {
        while (true) {
            if ($i >= jl_String_length($text))
                break a;
            $cw = $fm.$charWidth(jl_String_charAt($text, $i));
            $w = $w + $cw | 0;
            if (($w + $ellipsisW | 0) > $maxWidth)
                break;
            $sb.$append0(jl_String_charAt($text, $i));
            $i = $i + 1 | 0;
        }
    }
    return ($sb.$append11($rt_s(26))).$toString();
},
vr_RoomInfoCard_handleMouseMove = ($this, $mx, $my) => {
    $this.$hoverGear = $this.$gearBounds.$contains($mx, $my);
},
vr_RoomInfoCard_handleClick = ($this, $mx, $my) => {
    if ($this.$gearBounds.$contains($mx, $my) && $this.$controller.$isOwnerOfCurrentRoom())
        return 1;
    return 0;
},
vr_RoomInfoCard_toggle = $this => {
    $this.$visible = $this.$visible ? 0 : 1;
},
vr_RoomInfoCard_isVisible = $this => {
    return $this.$visible;
},
vr_RoomInfoCard_bottomAnchorY = $this => {
    let $h;
    $h = $this.$gp.$getHeight() <= 0 ? $this.$gp.$screenHeight : $this.$gp.$getHeight();
    return $h - 6 | 0;
},
vr_RoomInfoCard__clinit_ = () => {
    vs_Theme_$callClinit();
    vr_RoomInfoCard_CARD_BG_START = vs_Theme_CARD_GRAD_TOP;
    vr_RoomInfoCard_CARD_BG_END = vs_Theme_CARD_GRAD_BOTTOM;
    vr_RoomInfoCard_GOLD_LIGHT = vs_Theme_GOLD_LIGHT;
    vr_RoomInfoCard_GOLD_DARK = vs_Theme_GOLD_DARK;
    vr_RoomInfoCard_GOLD_FLAT = vs_Theme_GOLD_FLAT;
    vr_RoomInfoCard_TEXT_WHITE = vs_Theme_TEXT_WHITE;
    vr_RoomInfoCard_TEXT_PURPLE = vs_Theme_LAVENDER;
};
function c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0() {
    jl_Object.call(this);
    this.$_017 = null;
}
let c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_017 = var$1;
},
c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0__init_0 = var_0 => {
    let var_1 = new c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0();
    c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0__init_(var_1, var_0);
    return var_1;
},
c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0_run = var$0 => {
    var$0.$_017.$run();
},
c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0_run$exported$0 = var$1 => {
    var$1.$run();
},
otjde_EventListener = $rt_classWithoutFields(0);
function a_Component$bindMouse$lambda$_22_0() {
    jl_Object.call(this);
    this.$_03 = null;
}
let a_Component$bindMouse$lambda$_22_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_03 = var$1;
},
a_Component$bindMouse$lambda$_22_0__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_0();
    a_Component$bindMouse$lambda$_22_0__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_0_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_0_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_0_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$0(var$0.$_03, var$1);
},
a_Component$bindMouse$lambda$_22_0_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function a_Component$bindMouse$lambda$_22_1() {
    jl_Object.call(this);
    this.$_012 = null;
}
let a_Component$bindMouse$lambda$_22_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_012 = var$1;
},
a_Component$bindMouse$lambda$_22_1__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_1();
    a_Component$bindMouse$lambda$_22_1__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_1_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_1_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_1_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$1(var$0.$_012, var$1);
},
a_Component$bindMouse$lambda$_22_1_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
},
i_ImageIO = $rt_classWithoutFields(),
i_ImageIO_CACHE = null,
i_ImageIO_base = null,
i_ImageIO_$callClinit = () => {
    i_ImageIO_$callClinit = $rt_eraseClinit(i_ImageIO);
    i_ImageIO__clinit_();
},
i_ImageIO_setResourceBase = $prefix => {
    i_ImageIO_$callClinit();
    if ($prefix === null)
        $prefix = $rt_s(25);
    i_ImageIO_base = $prefix;
},
i_ImageIO_read = $url => {
    let $resolved, $cached, $img, $bi;
    i_ImageIO_$callClinit();
    $resolved = i_ImageIO_resolve($url);
    $cached = i_ImageIO_CACHE.$get0($resolved);
    if ($cached !== null)
        return $cached;
    $img = new Image();
    $bi = ai_BufferedImage__init_0($img);
    i_ImageIO_CACHE.$put($resolved, $bi);
    i_ImageIO_setSrc$js_body$_10($img, $rt_ustr($resolved));
    return $bi;
},
i_ImageIO_read0 = $stream => {
    i_ImageIO_$callClinit();
    $rt_throw(jl_UnsupportedOperationException__init_0($rt_s(27)));
},
i_ImageIO_preload = $urls => {
    let var$2, $done, var$4, $remaining, var$6, $url, $bi;
    i_ImageIO_$callClinit();
    var$2 = $urls.data;
    $done = c_CompletableFuture__init_();
    var$4 = var$2.length;
    if (!var$4) {
        $done.$complete(null);
        return $done;
    }
    $remaining = $rt_createIntArray(1);
    $remaining.data[0] = var$4;
    var$6 = 0;
    while (var$6 < var$4) {
        $url = var$2[var$6];
        $bi = i_ImageIO_read($url);
        i_ImageIO_onSettled$js_body$_11($bi.$element(), otji_JS_function(otji_JSWrapper_unwrap(i_ImageIO$preload$lambda$_5_0__init_0($remaining, $done)), "call"));
        var$6 = var$6 + 1 | 0;
    }
    return $done;
},
i_ImageIO_isLoaded = $image => {
    i_ImageIO_$callClinit();
    return $image !== null && $image.$getWidth() > 0 ? 1 : 0;
},
i_ImageIO_clearCache = () => {
    i_ImageIO_$callClinit();
    i_ImageIO_CACHE.$clear();
},
i_ImageIO_resolve = $url => {
    let var$2, var$3;
    i_ImageIO_$callClinit();
    if (jl_String_isEmpty(i_ImageIO_base))
        return $url;
    if (!jl_String_startsWith($url, $rt_s(28)) && !jl_String_startsWith($url, $rt_s(29)) && !jl_String_startsWith($url, $rt_s(30))) {
        if (!jl_String_startsWith($url, $rt_s(31)))
            return $url;
        var$2 = i_ImageIO_base;
        var$3 = jl_StringBuilder__init_();
        jl_StringBuilder_append(jl_StringBuilder_append(var$3, var$2), $url);
        return jl_StringBuilder_toString(var$3);
    }
    return $url;
},
i_ImageIO_lambda$preload$0 = ($remaining, $done) => {
    let var$3, var$4;
    i_ImageIO_$callClinit();
    var$3 = $remaining.data;
    var$4 = var$3[0] - 1 | 0;
    var$3[0] = var$4;
    if (!var$4)
        $done.$complete(null);
},
i_ImageIO__clinit_ = () => {
    i_ImageIO_CACHE = ju_HashMap__init_2();
    i_ImageIO_base = $rt_s(25);
},
i_ImageIO_setSrc$js_body$_10 = (var$1, var$2) => {
    var$1.src = var$2;
},
i_ImageIO_onSettled$js_body$_11 = (var$1, var$2) => {
    if (var$1.complete) {
        var$2();
        return;
    }
    var$1.addEventListener('load', function() {
        var$2();
    });
    var$1.addEventListener('error', function() {
        var$2();
    });
},
jl_Runnable = $rt_classWithoutFields(0);
function d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1() {
    jl_Object.call(this);
    this.$_031 = null;
}
let d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_031 = var$1;
},
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1();
    d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1_run = var$0 => {
    d_ConcurrencyTest_lambda$invokeLaterOrdering$24(var$0.$_031);
};
function d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0() {
    jl_Object.call(this);
    this.$_040 = null;
}
let d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_040 = var$1;
},
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0();
    d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0_run = var$0 => {
    d_ConcurrencyTest_lambda$invokeLaterOrdering$23(var$0.$_040);
},
n_WebSocket$Native = $rt_classWithoutFields(),
n_WebSocket$Native_bind$js_body$_2 = (var$1, var$2, var$3, var$4, var$5) => {
    var$1.onopen = function() {
        var$2();
    };
    var$1.onmessage = function(e) {
        var$3(typeof e.data === 'string' ? e.data : '');
    };
    var$1.onclose = function(e) {
        var$4(e.code, e.reason || '');
    };
    var$1.onerror = function() {
        var$5();
    };
};
function a_Component$bindMouse$lambda$_22_6() {
    jl_Object.call(this);
    this.$_043 = null;
}
let a_Component$bindMouse$lambda$_22_6__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_043 = var$1;
},
a_Component$bindMouse$lambda$_22_6__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_6();
    a_Component$bindMouse$lambda$_22_6__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_6_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_6_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_6_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$6(var$0.$_043, var$1);
},
a_Component$bindMouse$lambda$_22_6_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
},
a_Component$bindMouse$lambda$_22_7 = $rt_classWithoutFields(),
a_Component$bindMouse$lambda$_22_7__init_ = var$0 => {
    jl_Object__init_(var$0);
},
a_Component$bindMouse$lambda$_22_7__init_0 = () => {
    let var_0 = new a_Component$bindMouse$lambda$_22_7();
    a_Component$bindMouse$lambda$_22_7__init_(var_0);
    return var_0;
},
a_Component$bindMouse$lambda$_22_7_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$7(var$1);
},
a_Component$bindMouse$lambda$_22_7_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function a_Component$bindMouse$lambda$_22_4() {
    jl_Object.call(this);
    this.$_015 = null;
}
let a_Component$bindMouse$lambda$_22_4__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_015 = var$1;
},
a_Component$bindMouse$lambda$_22_4__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_4();
    a_Component$bindMouse$lambda$_22_4__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_4_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_4_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_4_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$4(var$0.$_015, var$1);
},
a_Component$bindMouse$lambda$_22_4_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
},
jl_ClassCastException = $rt_classWithoutFields(jl_RuntimeException),
juf_Supplier = $rt_classWithoutFields(0);
function a_Component$bindMouse$lambda$_22_5() {
    jl_Object.call(this);
    this.$_030 = null;
}
let a_Component$bindMouse$lambda$_22_5__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_030 = var$1;
},
a_Component$bindMouse$lambda$_22_5__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_5();
    a_Component$bindMouse$lambda$_22_5__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_5_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_5_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_5_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$5(var$0.$_030, var$1);
},
a_Component$bindMouse$lambda$_22_5_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function a_Component$bindMouse$lambda$_22_2() {
    jl_Object.call(this);
    this.$_019 = null;
}
let a_Component$bindMouse$lambda$_22_2__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_019 = var$1;
},
a_Component$bindMouse$lambda$_22_2__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_2();
    a_Component$bindMouse$lambda$_22_2__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_2_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_2_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_2_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$2(var$0.$_019, var$1);
},
a_Component$bindMouse$lambda$_22_2_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
},
d_ImageTest = $rt_classWithoutFields(),
d_ImageTest_check = ($name, $ok) => {
    let var$3, var$4;
    var$3 = !$ok ? $rt_s(32) : $rt_s(33);
    var$4 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append(var$4, var$3), $name);
    d_ImageTest_report$js_body$_0($rt_ustr(jl_StringBuilder_toString(var$4)));
},
d_ImageTest_run = () => {
    let $a, $again, $abs, $threw, $e, var$6, var$7, $$je;
    i_ImageIO_clearCache();
    i_ImageIO_setResourceBase($rt_s(34));
    $a = i_ImageIO_read($rt_s(35));
    d_ImageTest_check($rt_s(36), $a === null ? 0 : 1);
    d_ImageTest_check($rt_s(37), !$a.$getWidth() && !$a.$getHeight() ? 1 : 0);
    d_ImageTest_check($rt_s(38), i_ImageIO_isLoaded($a) ? 0 : 1);
    $again = i_ImageIO_read($rt_s(35));
    d_ImageTest_check($rt_s(39), $a !== $again ? 0 : 1);
    $abs = i_ImageIO_read($rt_s(40));
    d_ImageTest_check($rt_s(41), $abs === $a ? 0 : 1);
    $threw = 0;
    a: {
        try {
            i_ImageIO_read0(ji_ByteArrayInputStream__init_1($rt_createByteArrayFromData([1, 2, 3])));
            break a;
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_UnsupportedOperationException) {
                $e = $$je;
                $threw = jl_String_contains($e.$getMessage(), $rt_s(42));
                break a;
            } else {
                throw $$e;
            }
        }
    }
    d_ImageTest_check($rt_s(43), $threw);
    var$6 = i_ImageIO_preload($rt_wrapArray(jl_String, [$rt_s(35), $rt_s(44), $rt_s(45)]));
    var$7 = d_ImageTest$run$lambda$_3_0__init_0($a);
    var$6.$thenRun(var$7);
},
d_ImageTest_lambda$run$0 = $a => {
    let var$2;
    d_ImageTest_check($rt_s(46), 1);
    var$2 = $a.$getWidth() == 64 && $a.$getHeight() == 32 ? 1 : 0;
    d_ImageTest_check($rt_s(47), var$2);
    d_ImageTest_check($rt_s(48), i_ImageIO_isLoaded($a));
},
d_ImageTest_report$js_body$_0 = var$1 => {
    if (globalThis.__ankTest) globalThis.__ankTest(var$1);
};
function a_Component$bindMouse$lambda$_22_3() {
    jl_Object.call(this);
    this.$_033 = null;
}
let a_Component$bindMouse$lambda$_22_3__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_033 = var$1;
},
a_Component$bindMouse$lambda$_22_3__init_0 = var_0 => {
    let var_1 = new a_Component$bindMouse$lambda$_22_3();
    a_Component$bindMouse$lambda$_22_3__init_(var_1, var_0);
    return var_1;
},
a_Component$bindMouse$lambda$_22_3_handleEvent0 = (var$0, var$1) => {
    a_Component$bindMouse$lambda$_22_3_handleEvent(var$0, var$1);
},
a_Component$bindMouse$lambda$_22_3_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindMouse$3(var$0.$_033, var$1);
},
a_Component$bindMouse$lambda$_22_3_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
},
c_Executors = $rt_classWithoutFields(),
c_Executors_newSingleThreadExecutor = () => {
    return c_ExecutorService__init_0();
},
c_Executors_newSingleThreadScheduledExecutor = () => {
    return c_ScheduledExecutorService__init_0();
};
function c_ScheduledFuture() {
    let a = this; jl_Object.call(a);
    a.$handle2 = 0;
    a.$periodic = 0;
    a.$cancelled = 0;
    a.$done0 = 0;
    a.$value4 = null;
}
let c_ScheduledFuture__init_ = ($this, $handle, $periodic) => {
    jl_Object__init_($this);
    $this.$handle2 = $handle;
    $this.$periodic = $periodic;
},
c_ScheduledFuture__init_0 = (var_0, var_1) => {
    let var_2 = new c_ScheduledFuture();
    c_ScheduledFuture__init_(var_2, var_0, var_1);
    return var_2;
},
c_ScheduledFuture_complete = ($this, $v) => {
    $this.$value4 = $v;
    $this.$done0 = 1;
},
c_ScheduledFuture_isDone = $this => {
    return $this.$done0;
},
c_ScheduledFuture_isCancelled = $this => {
    return $this.$cancelled;
},
c_ScheduledFuture_cancel = ($this, $mayInterruptIfRunning) => {
    if (!$this.$done0 && !$this.$cancelled) {
        if (!$this.$periodic)
            clearTimeout($this.$handle2);
        else
            clearInterval($this.$handle2);
        $this.$cancelled = 1;
        return 1;
    }
    return 0;
},
s_SwingUtilities = $rt_classWithoutFields(),
s_SwingUtilities_invokeLater = $r => {
    ju_Objects_requireNonNull($r);
    c_EventLoop_defer$js_body$_1(otji_JS_function(otji_JSWrapper_unwrap(s_SwingUtilities$invokeLater$lambda$_1_0__init_0($r)), "run"));
},
s_SwingUtilities_invokeAndWait = $r => {
    $r.$run();
},
s_SwingUtilities_isEventDispatchThread = () => {
    return 1;
};
function s_SwingUtilities$invokeLater$lambda$_1_0() {
    jl_Object.call(this);
    this.$_038 = null;
}
let s_SwingUtilities$invokeLater$lambda$_1_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_038 = var$1;
},
s_SwingUtilities$invokeLater$lambda$_1_0__init_0 = var_0 => {
    let var_1 = new s_SwingUtilities$invokeLater$lambda$_1_0();
    s_SwingUtilities$invokeLater$lambda$_1_0__init_(var_1, var_0);
    return var_1;
},
s_SwingUtilities$invokeLater$lambda$_1_0_run = var$0 => {
    var$0.$_038.$run();
},
s_SwingUtilities$invokeLater$lambda$_1_0_run$exported$0 = var$1 => {
    var$1.$run();
},
ju_Iterator = $rt_classWithoutFields(0);
function ju_AbstractList$1() {
    let a = this; jl_Object.call(a);
    a.$index = 0;
    a.$modCount1 = 0;
    a.$size2 = 0;
    a.$removeIndex = 0;
    a.$this$04 = null;
}
let ju_AbstractList$1__init_ = ($this, $this$0) => {
    $this.$this$04 = $this$0;
    jl_Object__init_($this);
    $this.$modCount1 = $this.$this$04.$modCount;
    $this.$size2 = $this.$this$04.$size();
    $this.$removeIndex = (-1);
},
ju_AbstractList$1__init_0 = var_0 => {
    let var_1 = new ju_AbstractList$1();
    ju_AbstractList$1__init_(var_1, var_0);
    return var_1;
},
ju_AbstractList$1_hasNext = $this => {
    return $this.$index >= $this.$size2 ? 0 : 1;
},
ju_AbstractList$1_next = $this => {
    let var$1, var$2;
    ju_AbstractList$1_checkConcurrentModification($this);
    $this.$removeIndex = $this.$index;
    var$1 = $this.$this$04;
    var$2 = $this.$index;
    $this.$index = var$2 + 1 | 0;
    return var$1.$get1(var$2);
},
ju_AbstractList$1_checkConcurrentModification = $this => {
    if ($this.$modCount1 == $this.$this$04.$modCount)
        return;
    $rt_throw(ju_ConcurrentModificationException__init_0());
};
function ai_BufferedImage() {
    let a = this; jl_Object.call(a);
    a.$src = null;
    a.$canvas0 = null;
    a.$image = null;
    a.$width4 = 0;
    a.$height3 = 0;
}
let ai_BufferedImage__init_ = ($this, $img) => {
    jl_Object__init_($this);
    $this.$canvas0 = null;
    $this.$image = $img;
    $this.$src = $img;
    $this.$width4 = 0;
    $this.$height3 = 0;
},
ai_BufferedImage__init_0 = var_0 => {
    let var_1 = new ai_BufferedImage();
    ai_BufferedImage__init_(var_1, var_0);
    return var_1;
},
ai_BufferedImage_getWidth = $this => {
    return $this.$image === null ? $this.$width4 : $this.$image.width;
},
ai_BufferedImage_getHeight = $this => {
    return $this.$image === null ? $this.$height3 : $this.$image.height;
},
ai_BufferedImage_element = $this => {
    return $this.$image;
},
a_Component$Callback = $rt_classWithoutFields(0);
function a_Component$frame$lambda$_16_0() {
    jl_Object.call(this);
    this.$_023 = null;
}
let a_Component$frame$lambda$_16_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_023 = var$1;
},
a_Component$frame$lambda$_16_0__init_0 = var_0 => {
    let var_1 = new a_Component$frame$lambda$_16_0();
    a_Component$frame$lambda$_16_0__init_(var_1, var_0);
    return var_1;
},
a_Component$frame$lambda$_16_0_call = var$0 => {
    a_Component_frame(var$0.$_023);
},
a_Component$frame$lambda$_16_0_call$exported$0 = var$1 => {
    var$1.$call();
};
function mr_Room() {
    let a = this; jl_Object.call(a);
    a.$roomId = null;
    a.$roomName = null;
    a.$ownerUsername = null;
    a.$currentPlayerCount = 0;
    a.$maxPlayers = 0;
    a.$roomType = null;
}
let mr_Room__init_ = ($this, $roomId, $roomName, $ownerUsername, $currentPlayerCount, $maxPlayers, $roomType) => {
    jl_Object__init_($this);
    $this.$roomId = $roomId;
    $this.$roomName = $roomName;
    $this.$ownerUsername = $ownerUsername;
    $this.$currentPlayerCount = $currentPlayerCount;
    $this.$maxPlayers = $maxPlayers;
    $this.$roomType = $roomType;
},
mr_Room__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5) => {
    let var_6 = new mr_Room();
    mr_Room__init_(var_6, var_0, var_1, var_2, var_3, var_4, var_5);
    return var_6;
},
mr_Room_getRoomName = $this => {
    return $this.$roomName;
},
mr_Room_getOwnerUsername = $this => {
    return $this.$ownerUsername;
},
mr_Room_getCurrentPlayerCount = $this => {
    return $this.$currentPlayerCount;
},
mr_Room_getMaxPlayers = $this => {
    return $this.$maxPlayers;
};
function cr_RoomController() {
    let a = this; jl_Object.call(a);
    a.$room0 = null;
    a.$owner = 0;
}
let cr_RoomController__init_ = ($this, $room, $owner) => {
    jl_Object__init_($this);
    $this.$room0 = $room;
    $this.$owner = $owner;
},
cr_RoomController__init_0 = (var_0, var_1) => {
    let var_2 = new cr_RoomController();
    cr_RoomController__init_(var_2, var_0, var_1);
    return var_2;
},
cr_RoomController_getCurrentRoom = $this => {
    return $this.$room0;
},
cr_RoomController_isOwnerOfCurrentRoom = $this => {
    return $this.$owner;
},
jlr_Array = $rt_classWithoutFields(),
jlr_Array_newInstance = ($componentType, $length) => {
    let $cls;
    if ($componentType === null)
        $rt_throw(jl_NullPointerException__init_());
    if ($componentType === $rt_cls($rt_voidcls))
        $rt_throw(jl_IllegalArgumentException__init_());
    if ($length < 0)
        $rt_throw(jl_NegativeArraySizeException__init_0());
    $cls = jl_Class_getClassInfo($componentType);
    return otrr_ClassInfo_newArrayInstance($cls, $length);
},
n_WebSocket$Listener = $rt_classWithoutFields(0);
function d_InteractivePanel$_init_$lambda$_0_0() {
    jl_Object.call(this);
    this.$_010 = null;
}
let d_InteractivePanel$_init_$lambda$_0_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_010 = var$1;
},
d_InteractivePanel$_init_$lambda$_0_0__init_0 = var_0 => {
    let var_1 = new d_InteractivePanel$_init_$lambda$_0_0();
    d_InteractivePanel$_init_$lambda$_0_0__init_(var_1, var_0);
    return var_1;
},
d_InteractivePanel$_init_$lambda$_0_0_mouseWheelMoved = (var$0, var$1) => {
    d_InteractivePanel_lambda$new$0(var$0.$_010, var$1);
};
function d_ImageTest$run$lambda$_3_0() {
    jl_Object.call(this);
    this.$_09 = null;
}
let d_ImageTest$run$lambda$_3_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_09 = var$1;
},
d_ImageTest$run$lambda$_3_0__init_0 = var_0 => {
    let var_1 = new d_ImageTest$run$lambda$_3_0();
    d_ImageTest$run$lambda$_3_0__init_(var_1, var_0);
    return var_1;
},
d_ImageTest$run$lambda$_3_0_run = var$0 => {
    d_ImageTest_lambda$run$0(var$0.$_09);
},
jn_URIEncoderDecoder = $rt_classWithoutFields(),
jn_URIEncoderDecoder_validate = ($s, $legal) => {
    let $i, $ch, var$5, $d1, $d2;
    $i = 0;
    a: {
        b: {
            c: while ($i < jl_String_length($s)) {
                $ch = jl_String_charAt($s, $i);
                if ($ch == 37) {
                    while (true) {
                        var$5 = $i + 2 | 0;
                        if (var$5 >= jl_String_length($s))
                            $rt_throw(jn_URISyntaxException__init_($s, $rt_s(25), $i));
                        $d1 = jl_Character_digit(jl_String_charAt($s, $i + 1 | 0), 16);
                        $d2 = jl_Character_digit(jl_String_charAt($s, var$5), 16);
                        if ($d1 == (-1))
                            break b;
                        if ($d2 == (-1))
                            break b;
                        $i = $i + 3 | 0;
                        if ($i >= jl_String_length($s))
                            continue c;
                        if (jl_String_charAt($s, $i) != 37)
                            break;
                    }
                    continue;
                }
                if (!($ch >= 97 && $ch <= 122) && !($ch >= 65 && $ch <= 90) && !($ch >= 48 && $ch <= 57) && jl_String_indexOf($legal, $ch) <= (-1)) {
                    if ($ch <= 127)
                        break a;
                    if (jn_URIEncoderDecoder_isSpaceChar($ch))
                        break a;
                    if (jl_Character_isISOControl($ch))
                        break a;
                }
                $i = $i + 1 | 0;
            }
            return;
        }
        $rt_throw(jn_URISyntaxException__init_($s, $rt_s(25), $i));
    }
    $rt_throw(jn_URISyntaxException__init_($s, $rt_s(25), $i));
},
jn_URIEncoderDecoder_isSpaceChar = $c => {
    switch ($c) {
        case 9:
        case 32:
            break;
        default:
            return 0;
    }
    return 1;
},
jn_URIEncoderDecoder_validateSimple = ($s, $legal) => {
    let $i, $ch;
    $i = 0;
    while ($i < jl_String_length($s)) {
        $ch = jl_String_charAt($s, $i);
        if (!($ch >= 97 && $ch <= 122) && !($ch >= 65 && $ch <= 90) && !($ch >= 48 && $ch <= 57) && jl_String_indexOf($legal, $ch) <= (-1))
            $rt_throw(jn_URISyntaxException__init_($s, $rt_s(25), $i));
        $i = $i + 1 | 0;
    }
};
function jn_URISyntaxException() {
    let a = this; jl_Exception.call(a);
    a.$input = null;
    a.$index0 = 0;
}
let jn_URISyntaxException__init_1 = ($this, $input, $reason, $index) => {
    jl_Exception__init_($this, $reason);
    if ($input !== null && $reason !== null) {
        if ($index >= (-1)) {
            $this.$input = $input;
            $this.$index0 = $index;
            return;
        }
        $rt_throw(jl_IllegalArgumentException__init_());
    }
    $rt_throw(jl_NullPointerException__init_());
},
jn_URISyntaxException__init_ = (var_0, var_1, var_2) => {
    let var_3 = new jn_URISyntaxException();
    jn_URISyntaxException__init_1(var_3, var_0, var_1, var_2);
    return var_3;
},
jn_URISyntaxException__init_2 = ($this, $input, $reason) => {
    jl_Exception__init_($this, $reason);
    if ($input !== null && $reason !== null) {
        $this.$input = $input;
        $this.$index0 = (-1);
        return;
    }
    $rt_throw(jl_NullPointerException__init_());
},
jn_URISyntaxException__init_0 = (var_0, var_1) => {
    let var_2 = new jn_URISyntaxException();
    jn_URISyntaxException__init_2(var_2, var_0, var_1);
    return var_2;
},
jn_URISyntaxException_getIndex = $this => {
    return $this.$index0;
},
jn_URISyntaxException_getMessage = $this => {
    return $rt_s(25);
},
vs_IconBase = $rt_classWithoutFields(),
vs_IconBase_OUTLINE = null,
vs_IconBase_GOLD = null,
vs_IconBase_GOLD_DARK = null,
vs_IconBase_FILL = null,
vs_IconBase_GLINT = null,
vs_IconBase_$callClinit = () => {
    vs_IconBase_$callClinit = $rt_eraseClinit(vs_IconBase);
    vs_IconBase__clinit_();
},
vs_IconBase_paint = ($g, $x, $y, $size, $painter) => {
    let $g2, var$7, var$8, $$je;
    vs_IconBase_$callClinit();
    $g2 = $g.$create();
    a: {
        try {
            a_RenderingHints_$callClinit();
            $g2.$setRenderingHint(a_RenderingHints_KEY_ANTIALIASING, a_RenderingHints_VALUE_ANTIALIAS_ON);
            $g2.$setRenderingHint(a_RenderingHints_KEY_STROKE_CONTROL, a_RenderingHints_VALUE_STROKE_PURE);
            $g2.$setRenderingHint(a_RenderingHints_KEY_RENDERING, a_RenderingHints_VALUE_RENDER_QUALITY);
            $g2.$translate($x, $y);
            var$7 = $size / 64.0;
            $g2.$scale(var$7, var$7);
            $painter.$accept0($g2);
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            var$8 = $$je;
            break a;

        }
        $g2.$dispose();
        return;
    }
    $g2.$dispose();
    $rt_throw(var$8);
},
vs_IconBase__clinit_ = () => {
    vs_IconBase_OUTLINE = a_Color__init_(18, 24, 56);
    vs_IconBase_GOLD = a_Color__init_(245, 166, 35);
    vs_IconBase_GOLD_DARK = a_Color__init_(200, 130, 18);
    vs_IconBase_FILL = a_Color__init_(35, 43, 74);
    vs_IconBase_GLINT = a_Color__init_(185, 190, 220);
};
function otcit_DoubleAnalyzer$Result() {
    let a = this; jl_Object.call(a);
    a.$mantissa = Long_ZERO;
    a.$exponent = 0;
    a.$sign0 = 0;
}
let otcit_DoubleAnalyzer$Result__init_0 = $this => {
    jl_Object__init_($this);
},
otcit_DoubleAnalyzer$Result__init_ = () => {
    let var_0 = new otcit_DoubleAnalyzer$Result();
    otcit_DoubleAnalyzer$Result__init_0(var_0);
    return var_0;
};
function jn_URI$Helper() {
    jl_Object.call(this);
    this.$this$0 = null;
}
let jn_URI$Helper__init_0 = ($this, var$1) => {
    $this.$this$0 = var$1;
    jl_Object__init_($this);
},
jn_URI$Helper__init_ = var_0 => {
    let var_1 = new jn_URI$Helper();
    jn_URI$Helper__init_0(var_1, var_0);
    return var_1;
},
jn_URI$Helper_parseURI = ($this, $uri, $forceServer) => {
    let $index, var$4, var$5, var$6, var$7, $index2, $index3, var$10, $pathIndex;
    $this.$this$0.$string = $uri;
    $index = jl_String_indexOf($uri, 35);
    if ($index == (-1))
        var$4 = $uri;
    else {
        var$5 = $this.$this$0;
        var$6 = $index + 1 | 0;
        var$5.$fragment = jl_String_substring0($uri, var$6);
        jn_URI$Helper_validateFragment($this, $uri, $this.$this$0.$fragment, var$6);
        var$4 = jl_String_substring($uri, 0, $index);
    }
    a: {
        b: {
            var$7 = jl_String_indexOf(var$4, 58);
            $index2 = jl_String_indexOf(var$4, 47);
            $index3 = jl_String_indexOf(var$4, 63);
            if (var$7 != (-1) && !($index2 < var$7 && $index2 != (-1))) {
                if ($index3 >= var$7)
                    break b;
                if ($index3 == (-1))
                    break b;
            }
            $this.$this$0.$absolute = 0;
            $this.$this$0.$schemespecificpart = var$4;
            break a;
        }
        $this.$this$0.$absolute = 1;
        $this.$this$0.$scheme = jl_String_substring(var$4, 0, var$7);
        if (!jl_String_length($this.$this$0.$scheme))
            $rt_throw(jn_URISyntaxException__init_0($uri, $rt_s(25)));
        jn_URI$Helper_validateScheme($this, $uri, $this.$this$0.$scheme, 0);
        $this.$this$0.$schemespecificpart = jl_String_substring0(var$4, var$7 + 1 | 0);
        if (!jl_String_length($this.$this$0.$schemespecificpart))
            $rt_throw(jn_URISyntaxException__init_0($uri, $rt_s(25)));
    }
    c: {
        d: {
            if ($this.$this$0.$scheme !== null) {
                if (jl_String_length($this.$this$0.$schemespecificpart) > 0) {
                    var$5 = $this.$this$0.$schemespecificpart;
                    if (jl_String_charAt(var$5, 0) == 47)
                        break d;
                }
                $this.$this$0.$opaque = 1;
                jn_URI$Helper_validateSsp($this, $uri, $this.$this$0.$schemespecificpart, ($index2 + 2 | 0) + var$7 | 0);
                break c;
            }
        }
        $this.$this$0.$opaque = 0;
        var$5 = $this.$this$0.$schemespecificpart;
        var$10 = jl_String_indexOf(var$5, 63);
        if (var$10 != (-1)) {
            $this.$this$0.$query = jl_String_substring0(var$5, var$10 + 1 | 0);
            var$5 = jl_String_substring(var$5, 0, var$10);
            jn_URI$Helper_validateQuery($this, $uri, $this.$this$0.$query, ($index2 + 1 | 0) + var$10 | 0);
        }
        if (!jl_String_startsWith(var$5, $rt_s(49)))
            $this.$this$0.$path = var$5;
        else {
            var$10 = jl_String_indexOf0(var$5, 47, 2);
            if (var$10 != (-1)) {
                $this.$this$0.$authority = jl_String_substring(var$5, 2, var$10);
                $this.$this$0.$path = jl_String_substring0(var$5, var$10);
            } else {
                $this.$this$0.$authority = jl_String_substring0(var$5, 2);
                if (!jl_String_length($this.$this$0.$authority) && $this.$this$0.$query === null && $this.$this$0.$fragment === null)
                    $rt_throw(jn_URISyntaxException__init_0($uri, $rt_s(25)));
                $this.$this$0.$path = $rt_s(25);
            }
            if (!jl_String_length($this.$this$0.$authority))
                $this.$this$0.$authority = null;
            else
                jn_URI$Helper_validateAuthority($this, $uri, $this.$this$0.$authority, var$7 + 3 | 0);
        }
        $pathIndex = 0;
        if ($index2 > (-1))
            $pathIndex = $pathIndex + $index2 | 0;
        if (var$10 > (-1))
            $pathIndex = $pathIndex + var$10 | 0;
        jn_URI$Helper_validatePath($this, $uri, $this.$this$0.$path, $pathIndex);
    }
    jn_URI$Helper_parseAuthority($this, $forceServer);
},
jn_URI$Helper_validateScheme = ($this, $uri, $scheme, $index) => {
    let $ch, $e, $$je;
    $ch = jl_String_charAt($scheme, 0);
    if (!($ch >= 97 && $ch <= 122) && !($ch >= 65 && $ch <= 90))
        $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), 0));
    a: {
        try {
            jn_URIEncoderDecoder_validateSimple($scheme, $rt_s(50));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_validateSsp = ($this, $uri, $ssp, $index) => {
    let $e, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validate($ssp, $rt_s(51));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_validateAuthority = ($this, $uri, $authority, $index) => {
    let $e, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validate($authority, $rt_s(52));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_validatePath = ($this, $uri, $path, $index) => {
    let $e, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validate($path, $rt_s(53));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_validateQuery = ($this, $uri, $query, $index) => {
    let $e, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validate($query, $rt_s(54));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_validateFragment = ($this, $uri, $fragment, $index) => {
    let $e, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validate($fragment, $rt_s(51));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $e.$getIndex() | 0));
},
jn_URI$Helper_parseAuthority = ($this, $forceServer) => {
    let $tempUserinfo, $hostindex, $tempPort, $tempHost, $index, var$7, $endindex, $tempHost_0, $$je;
    if ($this.$this$0.$authority === null)
        return;
    $tempUserinfo = null;
    $hostindex = 0;
    $tempPort = (-1);
    $tempHost = $this.$this$0.$authority;
    $index = jl_String_indexOf($tempHost, 64);
    if ($index != (-1)) {
        $tempUserinfo = jl_String_substring($tempHost, 0, $index);
        jn_URI$Helper_validateUserinfo($this, $this.$this$0.$authority, $tempUserinfo, 0);
        $hostindex = $index + 1 | 0;
        $tempHost = jl_String_substring0($tempHost, $hostindex);
    }
    a: {
        b: {
            c: {
                var$7 = jl_String_lastIndexOf($tempHost, 58);
                $endindex = jl_String_indexOf($tempHost, 93);
                if (var$7 != (-1) && $endindex < var$7) {
                    $tempHost_0 = jl_String_substring($tempHost, 0, var$7);
                    if (var$7 >= (jl_String_length($tempHost) - 1 | 0))
                        $tempHost = $tempHost_0;
                    else
                        try {
                            $tempPort = jl_Integer_parseInt(jl_String_substring0($tempHost, var$7 + 1 | 0));
                            if ($tempPort < 0)
                                break b;
                            $tempHost = $tempHost_0;
                            break c;
                        } catch ($$e) {
                            $$je = $rt_wrapException($$e);
                            if ($$je instanceof jl_NumberFormatException) {
                                break a;
                            } else {
                                throw $$e;
                            }
                        }
                }
            }
            if (jl_String_equals($tempHost, $rt_s(25))) {
                if (!$forceServer)
                    return;
                $rt_throw(jn_URISyntaxException__init_($this.$this$0.$authority, $rt_s(25), $hostindex));
            }
            if (!jn_URI$Helper_isValidHost($this, $forceServer, $tempHost))
                return;
            $this.$this$0.$userinfo = $tempUserinfo;
            $this.$this$0.$host = $tempHost;
            $this.$this$0.$port = $tempPort;
            $this.$this$0.$serverAuthority = 1;
            return;
        }
        d: {
            try {
                if ($forceServer)
                    break d;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof jl_NumberFormatException) {
                    break a;
                } else {
                    throw $$e;
                }
            }
            return;
        }
        try {
            $rt_throw(jn_URISyntaxException__init_($this.$this$0.$authority, $rt_s(25), ($hostindex + var$7 | 0) + 1 | 0));
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_NumberFormatException) {
                break a;
            } else {
                throw $$e;
            }
        }
    }
    if (!$forceServer)
        return;
    $rt_throw(jn_URISyntaxException__init_($this.$this$0.$authority, $rt_s(25), ($hostindex + var$7 | 0) + 1 | 0));
},
jn_URI$Helper_validateUserinfo = ($this, $uri, $userinfo, $index) => {
    let $i, $ch;
    $i = 0;
    a: {
        while ($i < jl_String_length($userinfo)) {
            $ch = jl_String_charAt($userinfo, $i);
            if ($ch == 93)
                break a;
            if ($ch == 91)
                break a;
            $i = $i + 1 | 0;
        }
        return;
    }
    $rt_throw(jn_URISyntaxException__init_($uri, $rt_s(25), $index + $i | 0));
},
jn_URI$Helper_isValidHost = ($this, $forceServer, $host) => {
    let $index, var$4;
    if (jl_String_charAt($host, 0) == 91) {
        if (jl_String_charAt($host, jl_String_length($host) - 1 | 0) != 93)
            $rt_throw(jn_URISyntaxException__init_($host, $rt_s(25), 0));
        if (jn_URI$Helper_isValidIP6Address($this, $host))
            return 1;
        $rt_throw(jn_URISyntaxException__init_0($host, $rt_s(25)));
    }
    if (jl_String_indexOf($host, 91) == (-1) && jl_String_indexOf($host, 93) == (-1)) {
        $index = jl_String_lastIndexOf($host, 46);
        if ($index >= 0 && $index != (jl_String_length($host) - 1 | 0)) {
            var$4 = $index + 1 | 0;
            if (jl_Character_isDigit(jl_String_charAt($host, var$4))) {
                if (jn_URI$Helper_isValidIPv4Address($this, $host))
                    return 1;
                if (!$forceServer)
                    return 0;
                $rt_throw(jn_URISyntaxException__init_($host, $rt_s(25), 0));
            }
        }
        if (jn_URI$Helper_isValidDomainName($this, $host))
            return 1;
        if (!$forceServer)
            return 0;
        $rt_throw(jn_URISyntaxException__init_($host, $rt_s(25), 0));
    }
    $rt_throw(jn_URISyntaxException__init_($host, $rt_s(25), 0));
},
jn_URI$Helper_isValidDomainName = ($this, $host) => {
    let $index, $next, $label, $ch, $$je;
    a: {
        try {
            jn_URIEncoderDecoder_validateSimple($host, $rt_s(55));
            break a;
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
            } else {
                throw $$e;
            }
        }
        return 0;
    }
    $index = 0;
    while (true) {
        $next = jl_String_indexOf0($host, 46, $index);
        if ($next == (-1)) {
            if (jl_String_charAt($host, $index) != 45 && jl_String_charAt($host, jl_String_length($host) - 1 | 0) != 45) {
                $label = jl_String_substring0($host, $index);
                if (jl_String_equals($label, $host))
                    return 1;
                $ch = jl_String_charAt($label, 0);
                return $ch >= 48 && $ch <= 57 ? 0 : 1;
            }
            return 0;
        }
        if (jl_String_charAt($host, $index) == 45)
            break;
        if (jl_String_charAt($host, $next - 1 | 0) == 45)
            break;
        $index = $next + 1 | 0;
    }
    return 0;
},
jn_URI$Helper_isValidIPv4Address = ($this, $host) => {
    let $index, $num, var$4, $index2, var$6, $$je;
    a: {
        b: {
            try {
                $index = jl_String_indexOf($host, 46);
                $num = jl_Integer_parseInt(jl_String_substring($host, 0, $index));
                if ($num >= 0 && $num <= 255)
                    break b;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof jl_Exception) {
                    break a;
                } else {
                    throw $$e;
                }
            }
            return 0;
        }
        c: {
            try {
                var$4 = $index + 1 | 0;
                $index2 = jl_String_indexOf0($host, 46, var$4);
                var$4 = jl_Integer_parseInt(jl_String_substring($host, var$4, $index2));
                if (var$4 >= 0 && var$4 <= 255)
                    break c;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof jl_Exception) {
                    break a;
                } else {
                    throw $$e;
                }
            }
            return 0;
        }
        d: {
            try {
                var$6 = $index2 + 1 | 0;
                $index = jl_String_indexOf0($host, 46, var$6);
                var$4 = jl_Integer_parseInt(jl_String_substring($host, var$6, $index));
                if (var$4 >= 0 && var$4 <= 255)
                    break d;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof jl_Exception) {
                    break a;
                } else {
                    throw $$e;
                }
            }
            return 0;
        }
        e: {
            try {
                var$4 = jl_Integer_parseInt(jl_String_substring0($host, $index + 1 | 0));
                if (var$4 < 0)
                    break e;
                if (var$4 > 255)
                    break e;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof jl_Exception) {
                    break a;
                } else {
                    throw $$e;
                }
            }
            return 1;
        }
        try {
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_Exception) {
                break a;
            } else {
                throw $$e;
            }
        }
        return 0;
    }
    return 0;
},
jn_URI$Helper_isValidIP6Address = ($this, $ipAddress) => {
    let $length, $doubleColon, $numberOfColons, $numberOfPeriods, $word, $c, $offset, $i, var$10, var$11;
    $length = jl_String_length($ipAddress);
    $doubleColon = 0;
    $numberOfColons = 0;
    $numberOfPeriods = 0;
    $word = $rt_s(25);
    $c = 0;
    $offset = 0;
    if ($length < 2)
        return 0;
    $i = 0;
    a: while (true) {
        if ($i >= $length) {
            if ($numberOfPeriods > 0)
                return $numberOfPeriods == 3 && jn_URI$Helper_isValidIP4Word($this, $word) ? 1 : 0;
            if ($numberOfColons != 7 && !$doubleColon)
                return 0;
            b: {
                if (jl_String_isEmpty($word) && jl_String_charAt($ipAddress, ($length - 1 | 0) - $offset | 0) != 58) {
                    var$10 = ($length - 2 | 0) - $offset | 0;
                    if (jl_String_charAt($ipAddress, var$10) != 58) {
                        var$10 = 0;
                        break b;
                    }
                }
                var$10 = 1;
            }
            return var$10;
        }
        c: {
            d: {
                e: {
                    f: {
                        g: {
                            var$11 = jl_String_charAt($ipAddress, $i);
                            switch (var$11) {
                                case 46:
                                    break d;
                                case 58:
                                    break f;
                                case 91:
                                    break e;
                                case 93:
                                    break g;
                                default:
                            }
                            if (jl_String_length($word) > 3)
                                return 0;
                            if (!jn_URI$Helper_isValidHexChar($this, var$11))
                                return 0;
                            $word = jl_String_concat($word, jl_String_valueOf0(var$11));
                            break c;
                        }
                        if ($i != ($length - 1 | 0))
                            return 0;
                        if (jl_String_charAt($ipAddress, 0) != 91)
                            break a;
                        break c;
                    }
                    $numberOfColons = $numberOfColons + 1 | 0;
                    if ($numberOfColons > 7)
                        return 0;
                    if ($numberOfPeriods > 0)
                        return 0;
                    if ($c == 58) {
                        if ($doubleColon)
                            return 0;
                        $doubleColon = 1;
                    }
                    $word = $rt_s(25);
                    break c;
                }
                if ($i)
                    return 0;
                if (jl_String_charAt($ipAddress, $length - 1 | 0) != 93)
                    return 0;
                if (jl_String_charAt($ipAddress, 1) == 58 && jl_String_charAt($ipAddress, 2) != 58)
                    return 0;
                $offset = 1;
                if ($length < 4)
                    return 0;
                break c;
            }
            $numberOfPeriods = $numberOfPeriods + 1 | 0;
            if ($numberOfPeriods > 3)
                return 0;
            if (!jn_URI$Helper_isValidIP4Word($this, $word))
                return 0;
            if ($numberOfColons != 6 && !$doubleColon)
                return 0;
            if ($numberOfColons == 7) {
                var$10 = 0 + $offset | 0;
                if (jl_String_charAt($ipAddress, var$10) != 58) {
                    var$10 = 1 + $offset | 0;
                    if (jl_String_charAt($ipAddress, var$10) != 58)
                        return 0;
                }
            }
            $word = $rt_s(25);
        }
        $i = $i + 1 | 0;
        $c = var$11;
    }
    return 0;
},
jn_URI$Helper_isValidIP4Word = ($this, $word) => {
    let $i, $c;
    if (jl_String_length($word) >= 1 && jl_String_length($word) <= 3) {
        $i = 0;
        while (true) {
            if ($i >= jl_String_length($word))
                return jl_Integer_parseInt($word) > 255 ? 0 : 1;
            $c = jl_String_charAt($word, $i);
            if ($c < 48)
                break;
            if ($c > 57)
                break;
            $i = $i + 1 | 0;
        }
        return 0;
    }
    return 0;
},
jn_URI$Helper_isValidHexChar = ($this, $c) => {
    let var$2;
    a: {
        b: {
            if (!($c >= 48 && $c <= 57) && !($c >= 65 && $c <= 70)) {
                if ($c < 97)
                    break b;
                if ($c > 102)
                    break b;
            }
            var$2 = 1;
            break a;
        }
        var$2 = 0;
    }
    return var$2;
},
otpp_ResourceAccessor = $rt_classWithoutFields(),
jl_Iterable = $rt_classWithoutFields(0),
ju_Collection = $rt_classWithoutFields(0),
ju_AbstractCollection = $rt_classWithoutFields(),
ju_AbstractCollection__init_ = $this => {
    jl_Object__init_($this);
},
ju_AbstractCollection_isEmpty = $this => {
    return $this.$size() ? 0 : 1;
},
ju_AbstractCollection_contains = ($this, $o) => {
    let $iter, $e;
    $iter = $this.$iterator();
    while ($iter.$hasNext()) {
        $e = $iter.$next();
        if (ju_Objects_equals($e, $o))
            return 1;
    }
    return 0;
},
d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0 = $rt_classWithoutFields(),
d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0();
    d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0_run = var$0 => {
    d_ConcurrencyTest_lambda$fixedRateRepeatsAndCancels$16();
},
jl_AutoCloseable = $rt_classWithoutFields(0),
ji_Closeable = $rt_classWithoutFields(0),
ji_InputStream = $rt_classWithoutFields(),
ji_InputStream__init_ = $this => {
    jl_Object__init_($this);
};
function ji_ByteArrayInputStream() {
    let a = this; ji_InputStream.call(a);
    a.$buf = null;
    a.$pos = 0;
    a.$mark = 0;
    a.$count = 0;
}
let ji_ByteArrayInputStream__init_ = ($this, $buf, $offset, $length) => {
    ji_InputStream__init_($this);
    $this.$buf = $buf;
    $this.$pos = $offset;
    $this.$mark = $offset;
    $this.$count = $offset + $length | 0;
},
ji_ByteArrayInputStream__init_2 = (var_0, var_1, var_2) => {
    let var_3 = new ji_ByteArrayInputStream();
    ji_ByteArrayInputStream__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
ji_ByteArrayInputStream__init_0 = ($this, $buf) => {
    ji_ByteArrayInputStream__init_($this, $buf, 0, $buf.data.length);
},
ji_ByteArrayInputStream__init_1 = var_0 => {
    let var_1 = new ji_ByteArrayInputStream();
    ji_ByteArrayInputStream__init_0(var_1, var_0);
    return var_1;
},
otci_IntegerUtil = $rt_classWithoutFields(),
otci_IntegerUtil_toUnsignedLogRadixString = ($value, $radixLog2) => {
    let $radix, $mask, $sz, $chars, $pos, $target, var$9, $target_0;
    if (!$value)
        return $rt_s(56);
    $radix = 1 << $radixLog2;
    $mask = $radix - 1 | 0;
    $sz = (((32 - jl_Integer_numberOfLeadingZeros($value) | 0) + $radixLog2 | 0) - 1 | 0) / $radixLog2 | 0;
    $chars = $rt_createCharArray($sz);
    $pos = $rt_imul($sz - 1 | 0, $radixLog2);
    $target = 0;
    while ($pos >= 0) {
        var$9 = $chars.data;
        $target_0 = $target + 1 | 0;
        var$9[$target] = jl_Character_forDigit(($value >>> $pos | 0) & $mask, $radix);
        $pos = $pos - $radixLog2 | 0;
        $target = $target_0;
    }
    return jl_String__init_5($chars);
};
function a_Component$bindResize$lambda$_24_0() {
    jl_Object.call(this);
    this.$_032 = null;
}
let a_Component$bindResize$lambda$_24_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_032 = var$1;
},
a_Component$bindResize$lambda$_24_0__init_0 = var_0 => {
    let var_1 = new a_Component$bindResize$lambda$_24_0();
    a_Component$bindResize$lambda$_24_0__init_(var_1, var_0);
    return var_1;
},
a_Component$bindResize$lambda$_24_0_call = var$0 => {
    a_Component_lambda$bindResize$12(var$0.$_032);
},
a_Component$bindResize$lambda$_24_0_call$exported$0 = var$1 => {
    var$1.$call();
},
otji_JS = $rt_classWithoutFields(),
otji_JS_function = (var$1, var$2) => {
    if (var$1 === null || var$1 === undefined) {
        return null;
    }
    let name = 'jso$functor$' + var$2;
    let result = var$1[name];
    if (typeof result !== 'function') {
        let fn = function() {
            return var$1[var$2].apply(var$1, arguments);
        };
        result = () => fn;
        var$1[name] = result;
    }
    return result();
},
juf_Function = $rt_classWithoutFields(0);
function c_CompletableFuture$thenRun$lambda$_11_0() {
    jl_Object.call(this);
    this.$_024 = null;
}
let c_CompletableFuture$thenRun$lambda$_11_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_024 = var$1;
},
c_CompletableFuture$thenRun$lambda$_11_0__init_0 = var_0 => {
    let var_1 = new c_CompletableFuture$thenRun$lambda$_11_0();
    c_CompletableFuture$thenRun$lambda$_11_0__init_(var_1, var_0);
    return var_1;
},
c_CompletableFuture$thenRun$lambda$_11_0_apply0 = (var$0, var$1) => {
    return c_CompletableFuture$thenRun$lambda$_11_0_apply(var$0, var$1);
},
c_CompletableFuture$thenRun$lambda$_11_0_apply = (var$0, var$1) => {
    return c_CompletableFuture_lambda$thenRun$5(var$0.$_024, var$1);
},
otciu_UnicodeHelper = $rt_classWithoutFields(),
otciu_UnicodeHelper_decodeIntPairsDiff = $text => {
    let $flow, $sz, $data, $j, $lastKey, $lastValue, $i, var$9, var$10;
    $flow = otci_CharFlow__init_0(jl_String_toCharArray($text));
    $sz = otci_Base46_decodeUnsigned($flow);
    $data = $rt_createIntArray($sz * 2 | 0);
    $j = 0;
    $lastKey = 0;
    $lastValue = 0;
    $i = 0;
    while ($i < $sz) {
        var$9 = $data.data;
        $lastKey = $lastKey + otci_Base46_decode($flow) | 0;
        $lastValue = $lastValue + otci_Base46_decode($flow) | 0;
        var$10 = $j + 1 | 0;
        var$9[$j] = $lastKey;
        $j = var$10 + 1 | 0;
        var$9[var$10] = $lastValue;
        $i = $i + 1 | 0;
    }
    return $data;
},
otciu_UnicodeHelper_decodeByte = $c => {
    if ($c > 92)
        return (($c - 32 | 0) - 2 | 0) << 24 >> 24;
    if ($c <= 34)
        return ($c - 32 | 0) << 24 >> 24;
    return (($c - 32 | 0) - 1 | 0) << 24 >> 24;
},
otciu_UnicodeHelper_extractRle = $encoded => {
    let $ranges, $buffer, $index, $rangeIndex, $codePoint, $i, $b, $count, $pos, $j, $digit, var$13, var$14, var$15, var$16, var$17, var$18, $chunk;
    $ranges = $rt_createArray(otciu_UnicodeHelper$Range, 16384);
    $buffer = $rt_createByteArray(16384);
    $index = 0;
    $rangeIndex = 0;
    $codePoint = 0;
    $i = 0;
    while ($i < jl_String_length($encoded)) {
        $b = otciu_UnicodeHelper_decodeByte(jl_String_charAt($encoded, $i));
        if ($b == 64) {
            $i = $i + 1 | 0;
            $b = otciu_UnicodeHelper_decodeByte(jl_String_charAt($encoded, $i));
            $count = 0;
            $pos = 1;
            $j = 0;
            while ($j < 3) {
                $i = $i + 1 | 0;
                $digit = otciu_UnicodeHelper_decodeByte(jl_String_charAt($encoded, $i));
                $count = $count | $rt_imul($pos, $digit);
                $pos = $pos * 64 | 0;
                $j = $j + 1 | 0;
            }
        } else if ($b < 32)
            $count = 1;
        else {
            $b = ($b - 32 | 0) << 24 >> 24;
            $i = $i + 1 | 0;
            $count = otciu_UnicodeHelper_decodeByte(jl_String_charAt($encoded, $i));
        }
        if (!$b && $count >= 128) {
            if ($index > 0) {
                var$13 = $ranges.data;
                var$14 = $rangeIndex + 1 | 0;
                var$13[$rangeIndex] = otciu_UnicodeHelper$Range__init_0($codePoint, $codePoint + $index | 0, ju_Arrays_copyOf($buffer, $index));
                $rangeIndex = var$14;
            }
            $codePoint = $codePoint + ($index + $count | 0) | 0;
            $index = 0;
        } else
            while ($count > 0) {
                var$14 = $buffer.data.length;
                if ($index != var$14)
                    var$15 = $index;
                else {
                    var$13 = $ranges.data;
                    var$16 = $rangeIndex + 1 | 0;
                    var$17 = new otciu_UnicodeHelper$Range;
                    var$18 = $codePoint + $index | 0;
                    otciu_UnicodeHelper$Range__init_(var$17, $codePoint, var$18, ju_Arrays_copyOf($buffer, $index));
                    var$13[$rangeIndex] = var$17;
                    var$15 = 0;
                    $rangeIndex = var$16;
                    $codePoint = var$18;
                }
                $chunk = jl_Math_min($count, var$14 - var$15 | 0);
                $index = var$15 + $chunk | 0;
                ju_Arrays_fill0($buffer, var$15, $index, $b);
                $count = $count - $chunk | 0;
            }
        $i = $i + 1 | 0;
    }
    if ($index <= 0)
        var$14 = $rangeIndex;
    else {
        var$13 = $ranges.data;
        var$14 = $rangeIndex + 1 | 0;
        var$13[$rangeIndex] = otciu_UnicodeHelper$Range__init_0($codePoint, $codePoint + $index | 0, ju_Arrays_copyOf($buffer, $index));
    }
    return ju_Arrays_copyOf0($ranges, var$14);
};
function a_Font() {
    let a = this; jl_Object.call(a);
    a.$name0 = null;
    a.$style = 0;
    a.$size1 = 0;
}
let a_Font__init_0 = ($this, $name, $style, $size) => {
    jl_Object__init_($this);
    $this.$name0 = $name;
    $this.$style = $style;
    $this.$size1 = $size;
},
a_Font__init_ = (var_0, var_1, var_2) => {
    let var_3 = new a_Font();
    a_Font__init_0(var_3, var_0, var_1, var_2);
    return var_3;
},
a_Font_toCss = $this => {
    let $sb;
    $sb = jl_StringBuilder__init_();
    if ($this.$style & 2)
        $sb.$append11($rt_s(57));
    if ($this.$style & 1)
        $sb.$append11($rt_s(58));
    (($sb.$append1($this.$size1)).$append11($rt_s(59))).$append11(a_Font_mapFamily($this.$name0));
    return $sb.$toString();
},
a_Font_mapFamily = $awtName => {
    if (jl_String_equals($rt_s(22), $awtName))
        return $rt_s(60);
    if (jl_String_equals($rt_s(61), $awtName))
        return $rt_s(62);
    if (jl_String_equals($rt_s(63), $awtName))
        return $rt_s(64);
    if (!jl_String_equals($rt_s(65), $awtName))
        return $awtName;
    return $rt_s(60);
};
function c_CompletableFuture$supplyAsync$lambda$_2_0() {
    let a = this; jl_Object.call(a);
    a.$_042 = null;
    a.$_111 = null;
}
let c_CompletableFuture$supplyAsync$lambda$_2_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_042 = var$1;
    var$0.$_111 = var$2;
},
c_CompletableFuture$supplyAsync$lambda$_2_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_CompletableFuture$supplyAsync$lambda$_2_0();
    c_CompletableFuture$supplyAsync$lambda$_2_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_CompletableFuture$supplyAsync$lambda$_2_0_run = var$0 => {
    c_CompletableFuture_lambda$supplyAsync$0(var$0.$_042, var$0.$_111);
},
c_CompletableFuture$supplyAsync$lambda$_2_0_run$exported$0 = var$1 => {
    var$1.$run();
},
ju_Objects = $rt_classWithoutFields(),
ju_Objects_equals = ($a, $b) => {
    if ($a === $b)
        return 1;
    return $a !== null ? $a.$equals($b) : $b !== null ? 0 : 1;
},
ju_Objects_requireNonNull = $obj => {
    return ju_Objects_requireNonNull0($obj, $rt_s(25));
},
ju_Objects_requireNonNull0 = ($obj, $message) => {
    if ($obj !== null)
        return $obj;
    $rt_throw(jl_NullPointerException__init_2($message));
},
ju_Objects_checkFromIndexSize = ($fromIndex, $size, $length) => {
    if ($fromIndex >= 0 && $size >= 0 && $size <= ($length - $fromIndex | 0))
        return $fromIndex;
    $rt_throw(jl_IndexOutOfBoundsException__init_0());
};
function d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0() {
    jl_Object.call(this);
    this.$_041 = null;
}
let d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_041 = var$1;
},
d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0();
    d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0_call0 = var$0 => {
    return d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0_call(var$0);
},
d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0_call = var$0 => {
    return d_ConcurrencyTest_lambda$scheduleRespectsDelay$15(var$0.$_041);
},
ju_Map$Entry = $rt_classWithoutFields(0),
jl_Cloneable = $rt_classWithoutFields(0);
function ju_MapEntry() {
    let a = this; jl_Object.call(a);
    a.$key = null;
    a.$value = null;
}
let ju_MapEntry__init_ = ($this, $theKey, $theValue) => {
    jl_Object__init_($this);
    $this.$key = $theKey;
    $this.$value = $theValue;
},
ju_MapEntry__init_0 = (var_0, var_1) => {
    let var_2 = new ju_MapEntry();
    ju_MapEntry__init_(var_2, var_0, var_1);
    return var_2;
},
ju_MapEntry_equals = ($this, $object) => {
    let $entry;
    if ($this === $object)
        return 1;
    if (!$rt_isInstance($object, ju_Map$Entry))
        return 0;
    $entry = $object;
    return ju_Objects_equals($this.$key, $entry.$getKey()) && ju_Objects_equals($this.$value, $entry.$getValue()) ? 1 : 0;
};
function ju_HashMap$HashEntry() {
    let a = this; ju_MapEntry.call(a);
    a.$origKeyHash = 0;
    a.$next0 = null;
}
let ju_HashMap$HashEntry__init_ = ($this, $theKey, $hash) => {
    ju_MapEntry__init_($this, $theKey, null);
    $this.$origKeyHash = $hash;
},
ju_HashMap$HashEntry__init_0 = (var_0, var_1) => {
    let var_2 = new ju_HashMap$HashEntry();
    ju_HashMap$HashEntry__init_(var_2, var_0, var_1);
    return var_2;
};
function t_Duration() {
    jl_Object.call(this);
    this.$millis = Long_ZERO;
}
let t_Duration_ZERO = null,
t_Duration_$callClinit = () => {
    t_Duration_$callClinit = $rt_eraseClinit(t_Duration);
    t_Duration__clinit_();
},
t_Duration__init_0 = ($this, $millis) => {
    t_Duration_$callClinit();
    jl_Object__init_($this);
    $this.$millis = $millis;
},
t_Duration__init_ = var_0 => {
    let var_1 = new t_Duration();
    t_Duration__init_0(var_1, var_0);
    return var_1;
},
t_Duration_ofSeconds = $s => {
    t_Duration_$callClinit();
    return t_Duration__init_(Long_mul($s, Long_fromInt(1000)));
},
t_Duration__clinit_ = () => {
    t_Duration_ZERO = t_Duration__init_(Long_ZERO);
};
function c_ScheduledExecutorService$schedule$lambda$_2_0() {
    let a = this; jl_Object.call(a);
    a.$_011 = null;
    a.$_14 = null;
}
let c_ScheduledExecutorService$schedule$lambda$_2_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_011 = var$1;
    var$0.$_14 = var$2;
},
c_ScheduledExecutorService$schedule$lambda$_2_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_ScheduledExecutorService$schedule$lambda$_2_0();
    c_ScheduledExecutorService$schedule$lambda$_2_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_ScheduledExecutorService$schedule$lambda$_2_0_run = var$0 => {
    c_ScheduledExecutorService_lambda$schedule$1(var$0.$_011, var$0.$_14);
},
c_ScheduledExecutorService$schedule$lambda$_2_0_run$exported$0 = var$1 => {
    var$1.$run();
},
ju_SequencedCollection = $rt_classWithoutFields(0);
function ae_KeyEvent() {
    let a = this; jl_Object.call(a);
    a.$source1 = null;
    a.$keyCode = 0;
    a.$keyChar = 0;
    a.$shift = 0;
    a.$ctrl0 = 0;
    a.$alt0 = 0;
    a.$meta = 0;
    a.$consumed = 0;
}
let ae_KeyEvent__init_ = ($this, $source, $keyCode, $keyChar, $shift, $ctrl, $alt, $meta) => {
    jl_Object__init_($this);
    $this.$consumed = 0;
    $this.$source1 = $source;
    $this.$keyCode = $keyCode;
    $this.$keyChar = $keyChar;
    $this.$shift = $shift;
    $this.$ctrl0 = $ctrl;
    $this.$alt0 = $alt;
    $this.$meta = $meta;
},
ae_KeyEvent__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5, var_6) => {
    let var_7 = new ae_KeyEvent();
    ae_KeyEvent__init_(var_7, var_0, var_1, var_2, var_3, var_4, var_5, var_6);
    return var_7;
},
ae_KeyEvent_getKeyCode = $this => {
    return $this.$keyCode;
},
ae_KeyEvent_getKeyChar = $this => {
    return $this.$keyChar;
},
ae_KeyEvent_isConsumed = $this => {
    return $this.$consumed;
};
function c_ExecutorService$execute$lambda$_3_0() {
    jl_Object.call(this);
    this.$_039 = null;
}
let c_ExecutorService$execute$lambda$_3_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_039 = var$1;
},
c_ExecutorService$execute$lambda$_3_0__init_0 = var_0 => {
    let var_1 = new c_ExecutorService$execute$lambda$_3_0();
    c_ExecutorService$execute$lambda$_3_0__init_(var_1, var_0);
    return var_1;
},
c_ExecutorService$execute$lambda$_3_0_run = var$0 => {
    var$0.$_039.$run();
},
c_ExecutorService$execute$lambda$_3_0_run$exported$0 = var$1 => {
    var$1.$run();
},
a_Shape = $rt_classWithoutFields(0);
function ag_Area() {
    let a = this; jl_Object.call(a);
    a.$rec = null;
    a.$parts = null;
}
let ag_Area__init_0 = ($this, $s) => {
    jl_Object__init_($this);
    $this.$rec = ag_PathSink$Recording__init_0();
    $this.$parts = ju_ArrayList__init_();
    $this.$add0($s);
},
ag_Area__init_ = var_0 => {
    let var_1 = new ag_Area();
    ag_Area__init_0(var_1, var_0);
    return var_1;
},
ag_Area_add = ($this, $s) => {
    $s.$emit($this.$rec);
    $this.$parts.$add($s);
},
ag_Area_emit = ($this, $p) => {
    ag_PathSink$Recording_replay($this.$rec, $p);
},
n_WebSocket = $rt_classWithoutFields(0);
function n_BrowserWebSocket() {
    let a = this; jl_Object.call(a);
    a.$socket = null;
    a.$listener = null;
    a.$inputClosed = 0;
    a.$outputClosed = 0;
    a.$queued = null;
    a.$open = 0;
}
let n_BrowserWebSocket__init_ = ($this, $url, $listener, $ready) => {
    let var$4, var$5, var$6, var$7, var$8;
    jl_Object__init_($this);
    $this.$queued = ju_ArrayList__init_();
    $this.$listener = $listener;
    $this.$socket = new WebSocket($rt_ustr($url));
    var$4 = $this.$socket;
    var$5 = n_BrowserWebSocket$_init_$lambda$_0_0__init_0($this, $ready, $listener);
    var$6 = n_BrowserWebSocket$_init_$lambda$_0_1__init_0($this, $listener);
    var$7 = n_BrowserWebSocket$_init_$lambda$_0_2__init_0($this, $listener);
    var$8 = n_BrowserWebSocket$_init_$lambda$_0_3__init_0($this, $ready, $listener);
    n_WebSocket$Native_bind$js_body$_2(var$4, otji_JS_function(otji_JSWrapper_unwrap(var$5), "handle"), otji_JS_function(otji_JSWrapper_unwrap(var$6), "handle"), otji_JS_function(otji_JSWrapper_unwrap(var$7), "handle"), otji_JS_function(otji_JSWrapper_unwrap(var$8), "handle"));
},
n_BrowserWebSocket__init_0 = (var_0, var_1, var_2) => {
    let var_3 = new n_BrowserWebSocket();
    n_BrowserWebSocket__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
n_BrowserWebSocket_sendText = ($this, $data, $last) => {
    let $s;
    $s = $data.$toString();
    if (!$this.$open)
        $this.$queued.$add($s);
    else
        $this.$socket.send($rt_ustr($s));
    return c_CompletableFuture_completedFuture($this);
},
n_BrowserWebSocket_sendClose = ($this, $statusCode, $reason) => {
    let var$3;
    $this.$outputClosed = 1;
    var$3 = $this.$socket;
    if ($reason === null)
        $reason = $rt_s(25);
    var$3.close($statusCode, $rt_ustr($reason));
    return c_CompletableFuture_completedFuture($this);
},
n_BrowserWebSocket_request = ($this, $n) => {
    return;
},
n_BrowserWebSocket_isInputClosed = $this => {
    return $this.$inputClosed;
},
n_BrowserWebSocket_isOutputClosed = $this => {
    return $this.$outputClosed;
},
n_BrowserWebSocket_lambda$new$3 = ($this, $ready, $listener) => {
    let $e;
    $e = jl_RuntimeException__init_2($rt_s(66));
    if (!$ready.$isDone())
        $ready.$completeExceptionally($e);
    $listener.$onError($this, $e);
},
n_BrowserWebSocket_lambda$new$2 = ($this, $listener, $code, $reason) => {
    $this.$inputClosed = 1;
    $this.$outputClosed = 1;
    $listener.$onClose($this, $code, $reason);
},
n_BrowserWebSocket_lambda$new$1 = ($this, $listener, $text) => {
    $listener.$onText($this, $text, 1);
},
n_BrowserWebSocket_lambda$new$0 = ($this, $ready, $listener) => {
    let var$3, $s;
    $this.$open = 1;
    var$3 = $this.$queued.$iterator();
    while (var$3.$hasNext()) {
        $s = var$3.$next();
        $this.$socket.send($rt_ustr($s));
    }
    $this.$queued.$clear();
    $ready.$complete($this);
    $listener.$onOpen($this);
};
function otji_JSWrapper() {
    jl_Object.call(this);
    this.$js = null;
}
let otji_JSWrapper_unwrap = $o => {
    if ($o === null)
        return null;
    return !($o instanceof otji_JSWrapper) ? $o : $o.$js;
},
otp_Platform = $rt_classWithoutFields(),
ag_RoundRectangle2D = $rt_classWithoutFields(),
ag_RoundRectangle2D__init_ = $this => {
    jl_Object__init_($this);
},
ag_RoundRectangle2D_trace = ($this, $g2d) => {
    $this.$emit($g2d.$sink());
},
ag_RoundRectangle2D_emit = ($this, $p) => {
    let $x, $y, $w, $h, $r, var$7, var$8, var$9, var$10, var$11, var$12;
    $x = $this.$x();
    $y = $this.$y();
    $w = $this.$w();
    $h = $this.$h();
    $r = jl_Math_min0(jl_Math_min0($this.$arcW() / 2.0, $this.$arcH() / 2.0), jl_Math_min0($w / 2.0, $h / 2.0));
    var$7 = $x + $r;
    $p.$moveTo(var$7, $y);
    var$8 = $x + $w;
    var$9 = var$8 - $r;
    $p.$lineTo(var$9, $y);
    var$10 = $y + $r;
    $p.$quadTo(var$8, $y, var$8, var$10);
    var$11 = $y + $h;
    var$12 = var$11 - $r;
    $p.$lineTo(var$8, var$12);
    $p.$quadTo(var$8, var$11, var$9, var$11);
    $p.$lineTo(var$7, var$11);
    $p.$quadTo($x, var$11, $x, var$12);
    $p.$lineTo($x, var$10);
    $p.$quadTo($x, $y, var$7, $y);
    $p.$closePath();
};
function jl_Boolean() {
    jl_Object.call(this);
    this.$value3 = 0;
}
let jl_Boolean_TRUE = null,
jl_Boolean_FALSE = null,
jl_Boolean_TYPE = null,
jl_Boolean_$callClinit = () => {
    jl_Boolean_$callClinit = $rt_eraseClinit(jl_Boolean);
    jl_Boolean__clinit_();
},
jl_Boolean__init_0 = ($this, $value) => {
    jl_Boolean_$callClinit();
    jl_Object__init_($this);
    $this.$value3 = $value;
},
jl_Boolean__init_ = var_0 => {
    let var_1 = new jl_Boolean();
    jl_Boolean__init_0(var_1, var_0);
    return var_1;
},
jl_Boolean_valueOf = $value => {
    jl_Boolean_$callClinit();
    return !$value ? jl_Boolean_FALSE : jl_Boolean_TRUE;
},
jl_Boolean__clinit_ = () => {
    jl_Boolean_TRUE = jl_Boolean__init_(1);
    jl_Boolean_FALSE = jl_Boolean__init_(0);
    jl_Boolean_TYPE = $rt_cls($rt_booleancls);
},
d_WebSocketTest = $rt_classWithoutFields(),
d_WebSocketTest_events = null,
d_WebSocketTest_$callClinit = () => {
    d_WebSocketTest_$callClinit = $rt_eraseClinit(d_WebSocketTest);
    d_WebSocketTest__clinit_();
},
d_WebSocketTest_check = ($name, $ok) => {
    let var$3, var$4;
    d_WebSocketTest_$callClinit();
    var$3 = !$ok ? $rt_s(32) : $rt_s(33);
    var$4 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append(var$4, var$3), $name);
    d_WebSocketTest_report$js_body$_0($rt_ustr(jl_StringBuilder_toString(var$4)));
},
d_WebSocketTest_run = () => {
    let $client, $listener, var$3, var$4, $f;
    d_WebSocketTest_$callClinit();
    $client = n_HttpClient_newHttpClient();
    $listener = d_WebSocketTest$Listener__init_0();
    var$3 = $client.$newWebSocketBuilder();
    var$4 = var$3.$header($rt_s(67), $rt_s(68));
    var$4 = var$4.$connectTimeout(t_Duration_ofSeconds(Long_fromInt(10)));
    $f = var$4.$buildAsync(jn_URI_create($rt_s(69)), $listener);
    d_WebSocketTest_check($rt_s(70), $f === null ? 0 : 1);
    d_WebSocketTest_check($rt_s(71), $f.$isDone() ? 0 : 1);
    $f.$thenAccept(d_WebSocketTest$run$lambda$_3_0__init_0());
},
d_WebSocketTest_lambda$run$0 = $ws => {
    d_WebSocketTest_$callClinit();
    d_WebSocketTest_check($rt_s(72), 1);
    $ws.$sendText($rt_s(73), 1);
    d_WebSocketTest_check($rt_s(74), $ws.$isInputClosed() ? 0 : 1);
    $ws.$request(Long_fromInt(1));
    $ws.$sendClose(1000, $rt_s(75));
    d_WebSocketTest_check($rt_s(76), $ws.$isOutputClosed());
},
d_WebSocketTest__clinit_ = () => {
    d_WebSocketTest_events = ju_ArrayList__init_();
},
d_WebSocketTest_report$js_body$_0 = var$1 => {
    if (globalThis.__ankTest) globalThis.__ankTest(var$1);
},
juf_Consumer = $rt_classWithoutFields(0),
vs_GroupIcon$draw$lambda$_1_0 = $rt_classWithoutFields(),
vs_GroupIcon$draw$lambda$_1_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
vs_GroupIcon$draw$lambda$_1_0__init_0 = () => {
    let var_0 = new vs_GroupIcon$draw$lambda$_1_0();
    vs_GroupIcon$draw$lambda$_1_0__init_(var_0);
    return var_0;
},
vs_GroupIcon$draw$lambda$_1_0_accept0 = (var$0, var$1) => {
    vs_GroupIcon$draw$lambda$_1_0_accept(var$0, var$1);
},
vs_GroupIcon$draw$lambda$_1_0_accept = (var$0, var$1) => {
    vs_GroupIcon_paint(var$1);
},
jlr_AnnotatedElement = $rt_classWithoutFields(0),
jlr_GenericDeclaration = $rt_classWithoutFields(0),
vs_Theme = $rt_classWithoutFields(),
vs_Theme_PAGE = null,
vs_Theme_CARD = null,
vs_Theme_CARD_ALT = null,
vs_Theme_BORDER = null,
vs_Theme_INDIGO = null,
vs_Theme_GOLD = null,
vs_Theme_CARD_GRAD_TOP = null,
vs_Theme_CARD_GRAD_BOTTOM = null,
vs_Theme_GOLD_LIGHT = null,
vs_Theme_GOLD_DARK = null,
vs_Theme_GOLD_FLAT = null,
vs_Theme_TEXT_WHITE = null,
vs_Theme_LAVENDER = null,
vs_Theme_$callClinit = () => {
    vs_Theme_$callClinit = $rt_eraseClinit(vs_Theme);
    vs_Theme__clinit_();
},
vs_Theme__clinit_ = () => {
    vs_Theme_PAGE = a_Color__init_(13, 14, 28);
    vs_Theme_CARD = a_Color__init_(25, 29, 54);
    vs_Theme_CARD_ALT = a_Color__init_(34, 39, 66);
    vs_Theme_BORDER = a_Color__init_(44, 49, 85);
    vs_Theme_INDIGO = a_Color__init_(99, 102, 241);
    vs_Theme_GOLD = a_Color__init_(245, 166, 35);
    vs_Theme_CARD_GRAD_TOP = a_Color__init_(38, 28, 82);
    vs_Theme_CARD_GRAD_BOTTOM = a_Color__init_(20, 15, 45);
    vs_Theme_GOLD_LIGHT = a_Color__init_(230, 200, 120);
    vs_Theme_GOLD_DARK = a_Color__init_(160, 120, 50);
    vs_Theme_GOLD_FLAT = a_Color__init_(218, 165, 32);
    vs_Theme_TEXT_WHITE = a_Color__init_(250, 250, 250);
    vs_Theme_LAVENDER = a_Color__init_(160, 150, 190);
},
juf_BiConsumer = $rt_classWithoutFields(0);
function d_ConcurrencyTest$completableChain$lambda$_9_2() {
    jl_Object.call(this);
    this.$_021 = null;
}
let d_ConcurrencyTest$completableChain$lambda$_9_2__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_021 = var$1;
},
d_ConcurrencyTest$completableChain$lambda$_9_2__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$completableChain$lambda$_9_2();
    d_ConcurrencyTest$completableChain$lambda$_9_2__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$completableChain$lambda$_9_2_accept0 = (var$0, var$1, var$2) => {
    d_ConcurrencyTest$completableChain$lambda$_9_2_accept(var$0, var$1, var$2);
},
d_ConcurrencyTest$completableChain$lambda$_9_2_accept = (var$0, var$1, var$2) => {
    d_ConcurrencyTest_lambda$completableChain$19(var$0.$_021, var$1, var$2);
};
function d_ConcurrencyTest$completableChain$lambda$_9_1() {
    jl_Object.call(this);
    this.$_034 = null;
}
let d_ConcurrencyTest$completableChain$lambda$_9_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_034 = var$1;
},
d_ConcurrencyTest$completableChain$lambda$_9_1__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$completableChain$lambda$_9_1();
    d_ConcurrencyTest$completableChain$lambda$_9_1__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$completableChain$lambda$_9_1_accept0 = (var$0, var$1) => {
    d_ConcurrencyTest$completableChain$lambda$_9_1_accept(var$0, var$1);
},
d_ConcurrencyTest$completableChain$lambda$_9_1_accept = (var$0, var$1) => {
    d_ConcurrencyTest_lambda$completableChain$18(var$0.$_034, var$1);
},
d_ConcurrencyTest$completableChain$lambda$_9_0 = $rt_classWithoutFields(),
d_ConcurrencyTest$completableChain$lambda$_9_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$completableChain$lambda$_9_0__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$completableChain$lambda$_9_0();
    d_ConcurrencyTest$completableChain$lambda$_9_0__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$completableChain$lambda$_9_0_apply0 = (var$0, var$1) => {
    return d_ConcurrencyTest$completableChain$lambda$_9_0_apply(var$0, var$1);
},
d_ConcurrencyTest$completableChain$lambda$_9_0_apply = (var$0, var$1) => {
    return d_ConcurrencyTest_lambda$completableChain$17(var$1);
},
n_WebSocket$Builder = $rt_classWithoutFields(0),
ju_AbstractMap = $rt_classWithoutFields(),
ju_AbstractMap__init_ = $this => {
    jl_Object__init_($this);
};
function c_ScheduledExecutorService$schedule$lambda$_1_0() {
    let a = this; jl_Object.call(a);
    a.$_07 = null;
    a.$_12 = null;
}
let c_ScheduledExecutorService$schedule$lambda$_1_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_07 = var$1;
    var$0.$_12 = var$2;
},
c_ScheduledExecutorService$schedule$lambda$_1_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_ScheduledExecutorService$schedule$lambda$_1_0();
    c_ScheduledExecutorService$schedule$lambda$_1_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_ScheduledExecutorService$schedule$lambda$_1_0_run = var$0 => {
    c_ScheduledExecutorService_lambda$schedule$0(var$0.$_07, var$0.$_12);
},
c_ScheduledExecutorService$schedule$lambda$_1_0_run$exported$0 = var$1 => {
    var$1.$run();
};
function c_CompletableFuture$thenApply$lambda$_9_0() {
    let a = this; jl_Object.call(a);
    a.$_022 = null;
    a.$_17 = null;
}
let c_CompletableFuture$thenApply$lambda$_9_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_022 = var$1;
    var$0.$_17 = var$2;
},
c_CompletableFuture$thenApply$lambda$_9_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_CompletableFuture$thenApply$lambda$_9_0();
    c_CompletableFuture$thenApply$lambda$_9_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_CompletableFuture$thenApply$lambda$_9_0_accept0 = (var$0, var$1, var$2) => {
    c_CompletableFuture$thenApply$lambda$_9_0_accept(var$0, var$1, var$2);
},
c_CompletableFuture$thenApply$lambda$_9_0_accept = (var$0, var$1, var$2) => {
    c_CompletableFuture_lambda$thenApply$3(var$0.$_022, var$0.$_17, var$1, var$2);
},
jlr_Type = $rt_classWithoutFields(0);
function jl_Class() {
    let a = this; jl_Object.call(a);
    a.$flags = 0;
    a.$classInfo = null;
    a.$name = null;
}
let jl_Class__init_0 = ($this, $classInfo) => {
    jl_Object__init_($this);
    $this.$classInfo = $classInfo;
},
jl_Class__init_ = var_0 => {
    let var_1 = new jl_Class();
    jl_Class__init_0(var_1, var_0);
    return var_1;
},
jl_Class_createClass = $classInfo => {
    return jl_Class__init_($classInfo);
},
jl_Class_getClassInfo = $this => {
    return $this.$classInfo;
},
jl_Class_getName = $this => {
    let $metadataName, $result, $itemType, $itemName, var$5;
    if (!($this.$flags & 1)) {
        $this.$flags = $this.$flags | 1;
        $metadataName = $this.$classInfo[$rt_meta].name;
        $result = $metadataName === null ? null : $rt_str($metadataName);
        if ($result === null) {
            $itemType = $this.$classInfo[$rt_meta].itemType;
            if ($itemType !== null) {
                $itemName = jl_Class_getName($rt_cls($itemType));
                if ($itemName !== null) {
                    if ($itemType[$rt_meta].itemType !== null) {
                        var$5 = jl_StringBuilder__init_();
                        jl_StringBuilder_append(jl_StringBuilder_append1(var$5, 91), $itemName);
                        $result = jl_StringBuilder_toString(var$5);
                    } else {
                        var$5 = jl_StringBuilder__init_();
                        jl_StringBuilder_append1(jl_StringBuilder_append(jl_StringBuilder_append(var$5, $rt_s(77)), $itemName), 59);
                        $result = jl_StringBuilder_toString(var$5);
                    }
                }
            }
        }
        $this.$name = $result;
    }
    return $this.$name;
},
jl_Class_getComponentType = $this => {
    let $itemTypeInfo;
    $itemTypeInfo = $this.$classInfo[$rt_meta].itemType;
    return $itemTypeInfo === null ? null : $rt_cls($itemTypeInfo);
},
n_HttpClient = $rt_classWithoutFields(),
n_HttpClient__init_ = $this => {
    jl_Object__init_($this);
},
n_HttpClient__init_0 = () => {
    let var_0 = new n_HttpClient();
    n_HttpClient__init_(var_0);
    return var_0;
},
n_HttpClient_newHttpClient = () => {
    return n_HttpClient__init_0();
},
n_HttpClient_newWebSocketBuilder = $this => {
    return n_BrowserWebSocket$BuilderImpl__init_0();
},
ag_Ellipse2D = $rt_classWithoutFields(),
ag_Ellipse2D__init_ = $this => {
    jl_Object__init_($this);
},
ag_Ellipse2D_emit = ($this, $p) => {
    let $rx, $ry, $cx, $cy, $ox, $oy, var$8, var$9, var$10, var$11, var$12, var$13;
    $rx = $this.$w() / 2.0;
    $ry = $this.$h() / 2.0;
    $cx = $this.$x() + $rx;
    $cy = $this.$y() + $ry;
    $ox = $rx * 0.5522847498307936;
    $oy = $ry * 0.5522847498307936;
    var$8 = $cx + $rx;
    $p.$moveTo(var$8, $cy);
    var$9 = $cy + $oy;
    var$10 = $cx + $ox;
    var$11 = $cy + $ry;
    $p.$curveTo(var$8, var$9, var$10, var$11, $cx, var$11);
    var$12 = $cx - $ox;
    var$13 = $cx - $rx;
    $p.$curveTo(var$12, var$11, var$13, var$9, var$13, $cy);
    var$9 = $cy - $oy;
    var$11 = $cy - $ry;
    $p.$curveTo(var$13, var$9, var$12, var$11, $cx, var$11);
    $p.$curveTo(var$10, var$11, var$8, var$9, var$8, $cy);
    $p.$closePath();
};
function ag_Ellipse2D$Double() {
    let a = this; ag_Ellipse2D.call(a);
    a.$x2 = 0.0;
    a.$y2 = 0.0;
    a.$width3 = 0.0;
    a.$height1 = 0.0;
}
let ag_Ellipse2D$Double__init_ = ($this, $x, $y, $w, $h) => {
    ag_Ellipse2D__init_($this);
    $this.$x2 = $x;
    $this.$y2 = $y;
    $this.$width3 = $w;
    $this.$height1 = $h;
},
ag_Ellipse2D$Double__init_0 = (var_0, var_1, var_2, var_3) => {
    let var_4 = new ag_Ellipse2D$Double();
    ag_Ellipse2D$Double__init_(var_4, var_0, var_1, var_2, var_3);
    return var_4;
},
ag_Ellipse2D$Double_x = $this => {
    return $this.$x2;
},
ag_Ellipse2D$Double_y = $this => {
    return $this.$y2;
},
ag_Ellipse2D$Double_w = $this => {
    return $this.$width3;
},
ag_Ellipse2D$Double_h = $this => {
    return $this.$height1;
},
ju_Arrays = $rt_classWithoutFields(),
ju_Arrays_copyOf1 = ($array, $length) => {
    let var$3, $result, $sz, $i;
    var$3 = $array.data;
    $result = $rt_createCharArray($length);
    $sz = jl_Math_min($length, var$3.length);
    $i = 0;
    while ($i < $sz) {
        $result.data[$i] = var$3[$i];
        $i = $i + 1 | 0;
    }
    return $result;
},
ju_Arrays_copyOf = ($array, $length) => {
    let var$3, $result, $sz, $i;
    var$3 = $array.data;
    $result = $rt_createByteArray($length);
    $sz = jl_Math_min($length, var$3.length);
    $i = 0;
    while ($i < $sz) {
        $result.data[$i] = var$3[$i];
        $i = $i + 1 | 0;
    }
    return $result;
},
ju_Arrays_copyOf0 = ($original, $newLength) => {
    let var$3, $result, $sz, $i;
    var$3 = $original.data;
    $result = jlr_Array_newInstance(jl_Class_getComponentType(jl_Object_getClass($original)), $newLength);
    $sz = jl_Math_min($newLength, var$3.length);
    $i = 0;
    while ($i < $sz) {
        $result.data[$i] = var$3[$i];
        $i = $i + 1 | 0;
    }
    return $result;
},
ju_Arrays_fill0 = ($a, $fromIndex, $toIndex, $val) => {
    let var$5, var$6;
    if ($fromIndex > $toIndex)
        $rt_throw(jl_IllegalArgumentException__init_());
    while ($fromIndex < $toIndex) {
        var$5 = $a.data;
        var$6 = $fromIndex + 1 | 0;
        var$5[$fromIndex] = $val;
        $fromIndex = var$6;
    }
},
ju_Arrays_fill = ($a, $fromIndex, $toIndex, $val) => {
    let var$5, var$6;
    if ($fromIndex > $toIndex)
        $rt_throw(jl_IllegalArgumentException__init_());
    while ($fromIndex < $toIndex) {
        var$5 = $a.data;
        var$6 = $fromIndex + 1 | 0;
        var$5[$fromIndex] = $val;
        $fromIndex = var$6;
    }
},
ju_Arrays_fill1 = ($a, $val) => {
    ju_Arrays_fill($a, 0, $a.data.length, $val);
},
ju_Arrays_binarySearch = ($a, $key) => {
    return ju_Arrays_binarySearch0($a, 0, $a.data.length, $key);
},
ju_Arrays_binarySearch0 = ($a, $fromIndex, $toIndex, $key) => {
    let $u, var$6, $i, $e, var$9;
    if ($fromIndex > $toIndex)
        $rt_throw(jl_IllegalArgumentException__init_());
    $u = $toIndex - 1 | 0;
    while (true) {
        if ($fromIndex > $u)
            return ( -$fromIndex | 0) - 1 | 0;
        var$6 = $a.data;
        $i = ($fromIndex + $u | 0) / 2 | 0;
        $e = var$6[$i];
        var$9 = $rt_compare($e, $key);
        if (!var$9)
            break;
        if (var$9 <= 0)
            $fromIndex = $i + 1 | 0;
        else
            $u = $i - 1 | 0;
    }
    return $i;
},
a_Composite = $rt_classWithoutFields(0);
function a_AlphaComposite() {
    let a = this; jl_Object.call(a);
    a.$rule = 0;
    a.$alpha = 0.0;
}
let a_AlphaComposite__init_0 = ($this, $rule, $alpha) => {
    jl_Object__init_($this);
    $this.$rule = $rule;
    $this.$alpha = $alpha;
},
a_AlphaComposite__init_ = (var_0, var_1) => {
    let var_2 = new a_AlphaComposite();
    a_AlphaComposite__init_0(var_2, var_0, var_1);
    return var_2;
},
a_AlphaComposite_getInstance = ($rule, $alpha) => {
    return a_AlphaComposite__init_($rule, $alpha);
},
a_AlphaComposite_getAlpha = $this => {
    return $this.$alpha;
};
function a_Component$bindKeyboard$lambda$_23_2() {
    jl_Object.call(this);
    this.$_00 = null;
}
let a_Component$bindKeyboard$lambda$_23_2__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_00 = var$1;
},
a_Component$bindKeyboard$lambda$_23_2__init_0 = var_0 => {
    let var_1 = new a_Component$bindKeyboard$lambda$_23_2();
    a_Component$bindKeyboard$lambda$_23_2__init_(var_1, var_0);
    return var_1;
},
a_Component$bindKeyboard$lambda$_23_2_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindKeyboard$10(var$0.$_00, var$1);
},
a_Component$bindKeyboard$lambda$_23_2_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function a_Component$bindKeyboard$lambda$_23_1() {
    jl_Object.call(this);
    this.$_036 = null;
}
let a_Component$bindKeyboard$lambda$_23_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_036 = var$1;
},
a_Component$bindKeyboard$lambda$_23_1__init_0 = var_0 => {
    let var_1 = new a_Component$bindKeyboard$lambda$_23_1();
    a_Component$bindKeyboard$lambda$_23_1__init_(var_1, var_0);
    return var_1;
},
a_Component$bindKeyboard$lambda$_23_1_handleEvent0 = (var$0, var$1) => {
    a_Component$bindKeyboard$lambda$_23_1_handleEvent(var$0, var$1);
},
a_Component$bindKeyboard$lambda$_23_1_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindKeyboard$9(var$0.$_036, var$1);
},
a_Component$bindKeyboard$lambda$_23_1_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function a_Component$bindKeyboard$lambda$_23_0() {
    jl_Object.call(this);
    this.$_025 = null;
}
let a_Component$bindKeyboard$lambda$_23_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_025 = var$1;
},
a_Component$bindKeyboard$lambda$_23_0__init_0 = var_0 => {
    let var_1 = new a_Component$bindKeyboard$lambda$_23_0();
    a_Component$bindKeyboard$lambda$_23_0__init_(var_1, var_0);
    return var_1;
},
a_Component$bindKeyboard$lambda$_23_0_handleEvent0 = (var$0, var$1) => {
    a_Component$bindKeyboard$lambda$_23_0_handleEvent(var$0, var$1);
},
a_Component$bindKeyboard$lambda$_23_0_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindKeyboard$8(var$0.$_025, var$1);
},
a_Component$bindKeyboard$lambda$_23_0_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function ae_FocusEvent() {
    jl_Object.call(this);
    this.$source = null;
}
let ae_FocusEvent__init_ = ($this, $source) => {
    jl_Object__init_($this);
    $this.$source = $source;
},
ae_FocusEvent__init_0 = var_0 => {
    let var_1 = new ae_FocusEvent();
    ae_FocusEvent__init_(var_1, var_0);
    return var_1;
};
function c_CompletableFuture$exceptionally$lambda$_13_0() {
    let a = this; jl_Object.call(a);
    a.$_037 = null;
    a.$_110 = null;
}
let c_CompletableFuture$exceptionally$lambda$_13_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_037 = var$1;
    var$0.$_110 = var$2;
},
c_CompletableFuture$exceptionally$lambda$_13_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_CompletableFuture$exceptionally$lambda$_13_0();
    c_CompletableFuture$exceptionally$lambda$_13_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_CompletableFuture$exceptionally$lambda$_13_0_accept0 = (var$0, var$1, var$2) => {
    c_CompletableFuture$exceptionally$lambda$_13_0_accept(var$0, var$1, var$2);
},
c_CompletableFuture$exceptionally$lambda$_13_0_accept = (var$0, var$1, var$2) => {
    c_CompletableFuture_lambda$exceptionally$8(var$0.$_037, var$0.$_110, var$1, var$2);
},
jl_Character = $rt_classWithoutFields(),
jl_Character_TYPE = null,
jl_Character_digitMapping = null,
jl_Character_classMapping = null,
jl_Character_characterCache = null,
jl_Character_$$metadata$$3 = null,
jl_Character_$$metadata$$4 = null,
jl_Character_$callClinit = () => {
    jl_Character_$callClinit = $rt_eraseClinit(jl_Character);
    jl_Character__clinit_();
},
jl_Character_isBmpCodePoint = $codePoint => {
    jl_Character_$callClinit();
    return $codePoint > 0 && $codePoint <= 65535 ? 1 : 0;
},
jl_Character_isHighSurrogate = $ch => {
    jl_Character_$callClinit();
    return ($ch & 64512) != 55296 ? 0 : 1;
},
jl_Character_isLowSurrogate = $ch => {
    jl_Character_$callClinit();
    return ($ch & 64512) != 56320 ? 0 : 1;
},
jl_Character_isSurrogate = $ch => {
    jl_Character_$callClinit();
    return !jl_Character_isHighSurrogate($ch) && !jl_Character_isLowSurrogate($ch) ? 0 : 1;
},
jl_Character_highSurrogate = $codePoint => {
    let var$2;
    jl_Character_$callClinit();
    var$2 = $codePoint - 65536 | 0;
    return (55296 | var$2 >> 10 & 1023) & 65535;
},
jl_Character_lowSurrogate = $codePoint => {
    jl_Character_$callClinit();
    return (56320 | $codePoint & 1023) & 65535;
},
jl_Character_digit = ($ch, $radix) => {
    jl_Character_$callClinit();
    return jl_Character_digit0($ch, $radix);
},
jl_Character_digit0 = ($codePoint, $radix) => {
    let $d;
    jl_Character_$callClinit();
    if ($radix >= 2 && $radix <= 36) {
        $d = jl_Character_getNumericValue($codePoint);
        if ($d >= $radix)
            $d = (-1);
        return $d;
    }
    return (-1);
},
jl_Character_getNumericValue = $codePoint => {
    let $digitMapping, var$3, $l, $u, $idx, var$7, $val, var$9;
    jl_Character_$callClinit();
    $digitMapping = jl_Character_getDigitMapping();
    var$3 = $digitMapping.data;
    $l = 0;
    $u = (var$3.length / 2 | 0) - 1 | 0;
    while ($u >= $l) {
        $idx = ($l + $u | 0) / 2 | 0;
        var$7 = $idx * 2 | 0;
        $val = var$3[var$7];
        var$9 = $rt_compare($codePoint, $val);
        if (var$9 > 0)
            $l = $idx + 1 | 0;
        else {
            if (var$9 >= 0)
                return var$3[var$7 + 1 | 0];
            $u = $idx - 1 | 0;
        }
    }
    return (-1);
},
jl_Character_forDigit = ($digit, $radix) => {
    jl_Character_$callClinit();
    if ($radix >= 2 && $radix <= 36 && $digit >= 0 && $digit < $radix)
        return $digit < 10 ? (48 + $digit | 0) & 65535 : ((97 + $digit | 0) - 10 | 0) & 65535;
    return 0;
},
jl_Character_isDigit = $ch => {
    jl_Character_$callClinit();
    return jl_Character_isDigit0($ch);
},
jl_Character_isDigit0 = $codePoint => {
    jl_Character_$callClinit();
    return jl_Character_getType($codePoint) != 9 ? 0 : 1;
},
jl_Character_getDigitMapping = () => {
    jl_Character_$callClinit();
    if (jl_Character_digitMapping === null)
        jl_Character_digitMapping = otciu_UnicodeHelper_decodeIntPairsDiff(((jl_Character_obtainDigitMapping()).value !== null ? $rt_str((jl_Character_obtainDigitMapping()).value) : null));
    return jl_Character_digitMapping;
},
jl_Character_obtainDigitMapping = () => {
    jl_Character_$callClinit();
    if (jl_Character_$$metadata$$3 === null)
        jl_Character_$$metadata$$3 = jl_Character_obtainDigitMapping$$create();
    return jl_Character_$$metadata$$3;
},
jl_Character_getClasses = () => {
    jl_Character_$callClinit();
    if (jl_Character_classMapping === null)
        jl_Character_classMapping = otciu_UnicodeHelper_extractRle(((jl_Character_obtainClasses()).value !== null ? $rt_str((jl_Character_obtainClasses()).value) : null));
    return jl_Character_classMapping;
},
jl_Character_obtainClasses = () => {
    jl_Character_$callClinit();
    if (jl_Character_$$metadata$$4 === null)
        jl_Character_$$metadata$$4 = jl_Character_obtainClasses$$create();
    return jl_Character_$$metadata$$4;
},
jl_Character_isISOControl = $ch => {
    jl_Character_$callClinit();
    return jl_Character_isISOControl0($ch);
},
jl_Character_isISOControl0 = $codePoint => {
    let var$2;
    jl_Character_$callClinit();
    a: {
        b: {
            if (!($codePoint >= 0 && $codePoint <= 31)) {
                if ($codePoint < 127)
                    break b;
                if ($codePoint > 159)
                    break b;
            }
            var$2 = 1;
            break a;
        }
        var$2 = 0;
    }
    return var$2;
},
jl_Character_getType = $codePoint => {
    let $classes, var$3, $l, $u, $i, $range;
    jl_Character_$callClinit();
    if (jl_Character_isBmpCodePoint($codePoint) && jl_Character_isSurrogate($codePoint & 65535))
        return 19;
    $classes = jl_Character_getClasses();
    var$3 = $classes.data;
    $l = 0;
    $u = var$3.length - 1 | 0;
    while ($l <= $u) {
        $i = ($l + $u | 0) / 2 | 0;
        $range = var$3[$i];
        if ($codePoint >= $range.$end)
            $l = $i + 1 | 0;
        else {
            if ($codePoint >= $range.$start0)
                return $range.$data.data[$codePoint - $range.$start0 | 0];
            $u = $i - 1 | 0;
        }
    }
    return 0;
},
jl_Character__clinit_ = () => {
    jl_Character_TYPE = $rt_cls($rt_charcls);
    jl_Character_characterCache = $rt_createArray(jl_Character, 128);
},
jl_Character_obtainDigitMapping$$create = () => {
    return {"value" : "6G*% %%%%%%%%%%%%%%%%%%A%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=,#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%_H#T#%%%%%%%%%%%%%%%%%%s+G%%%%%%%%%%%%%%%%%%_1G%%%%%%%%%%%%%%%%%%{CG%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%6)G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%*\'G%%%%%%%%%%%%%%%%%%.9G%%%%%%%%%%%%%%%%%%*\'G%%%%%%%%%%%%%%%%%%!i#G"
    + "%%%%%%%%%%%%%%%%%%c#G%%%%%%%%%%%%%%%%%%*;G%%%%%%%%%%%%%%%%%%Z+G%%%%%%%%%%%%%%%%%%:/G%%%%%%%%%%%%%%%%%%=G%%%%%%%%%%%%%%%%%%{/G%%%%%%%%%%%%%%%%%%k\'G%%%%%%%%%%%%%%%%%%s+G%%%%%%%%%%%%%%%%%%=G%%%%%%%%%%%%%%%%%%R@dG%%%%%%%%%%%%%%%%%%R[G%%%%%%%%%%%%%%%%%%c#G%%%%%%%%%%%%%%%%%%_1G%%%%%%%%%%%%%%%%%%!#G%%%%%%%%%%%%%%%%%%k\'G%%%%%%%%%%%%%%%%%%cCG%%%%%%%%%%%%%%%%%%o*IG%%%%%%%%%%%%%%%%%%A%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=,#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%c:#T#%%%%%%%%%%%%%%%%%%w&%G%%%%%"
    + "%%%%%%%%%%%%%=G%%%%%%%%%%%%%%%%%%_fG%%%%%%%%%%%%%%%%%%Z+G%%%%%%%%%%%%%%%%%%_%G%%%%%%%%%%%%%%%%%%>-G%%%%%%%%%%%%%%%%%%.9G%%%%%%%%%%%%%%%%%%w=G%%%%%%%%%%%%%%%%%%2+G%%%%%%%%%%%%%%%%%%>AG%%%%%%%%%%%%%%%%%%N)G%%%%%%%%%%%%%%%%%%=G%%%%%%%%%%%%%%%%%%%G%%%%%%%%%%%%%%%%%%B\'G%%%%%%%%%%%%%%%%%%FEG%%%%%%%%%%%%%%%%%%N)G%%%%%%%%%%%%%%%%%%oYG%%%%%%%%%%%%%%%%%%k\'G%%%%%%%%%%%%%%%%%%g5G%%%%%%%%%%%%%%%%%%*\'G%%%%%%%%%%%%%%%%%%F%G%%%%%%%%%%%%%%%%%%Z?G%%%%%%%%%%%%%%%%%%ow?G%%%%%%%%%%%%%%%%%%s4%G%%%%%%%%%%%%%%%%%%k\'G%%%%%%%%%%%%%%"
    + "%%%%s+G%%%%%%%%%%%%%%%%%%:OG%%%%%%%%%%%%%%%%%%c#G%%%%%%%%%%%%%%%%%%N&OG%%%%%%%%%%%%%%%%%%VZ%G%%%%%%%%%%%%%%%%%%%G%%%%%%%%%%%%%%%%%%%G%%%%%%%%%%%%%%%%%%%G%%%%%%%%%%%%%%%%%%%G%%%%%%%%%%%%%%%%%%!8%G%%%%%%%%%%%%%%%%%%FEG%%%%%%%%%%%%%%%%%%sKG%%%%%%%%%%%%%%%%%%k5G%%%%%%%%%%%%%%%%%%.lG%%%%%%%%%%%%%%%%%%wN)G%%%%%%%%%%%%%%%%%%"};
},
jl_Character_obtainClasses$$create = () => {
    return {"value" : "PA-Y$;Y$679:95Y#J+Y#Z$Y#B;697<8<C;6:7:PB-9[%=9<=&>:1=<=:L#<#Y#<,&?L$9B8:B(C9:C)!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!C#!#!#!#!#!#!#!#!C#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#B##!#!C$B##!#B##B$C#B%#B##B$C$B##B##!#!#B##!C#!#B##B$#!#B#C#&!C$F%!$#!$#!$#!#!#!#!#!#!#!#!C#!#!#!#!#!#!#!#!#!C#!$#!#B$#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!C(B##B#C#!#B%#!#!#!#!CgF#C;E3]%E-]/E&](%<%]2b\'Q! !#!#%<!#A#%C$9!A%]#!9B$ ! B##B2 B*CD!C#B$C$!#!#!#!#!#!#!#!#!#!#!#!C&!#:!#B#C#BTCQ!#!#!#!"
    + "#!#!#!#!#!#!#!#!#!#!#!#!#!#=G&H#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#B##!#!#!#!#!#!C#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!# BG E#Y\'CJ95E#^#; GN5\'9G#9G#9G$A\'F<A%F%Y#A,Q\'Z$Y#;Y#^#G,91Y$FA%F+G6J+Y%F#\'b&D! 9&G(1=G\'E#G#=G%F#J+F$^#&Y/ 1&\'F?G<A#b&:! G,&A/J+FBG*E#=Y$%A#\'[#F7G%%G*%G$%G&A#Y0 F:G$A#9 F,A&F9<F(Q#A&G*FJ%G91GA)FW\')\'&I$G)I%\'I#&G(F+G#Y#J+9%F0\'I#\'F)A#F#A#F7 F( &A$F%A#\'&I$G%A#I#A#I#\'&A))A%F# F$G#A#J+F#[#L\'=;&9\'& G#) F\'A%F#A#F7 F( F# F"
    + "# F#A#\' I$G#A%G#A#G$A$\'A(F% &A(J+G#F$\'9A+G#) F* F$ F7 F( F# F&A#\'&I$G& G#) I#\'A#&A0F#G#A#J+9;A(&G\' \'I# F)A#F#A#F7 F( F# F&A#\'&)\')G%A#I#A#I#\'A&G%)A%F# F$G#A#J+=&L\'A+\'& F\'A$F$ F%A$F# & F#A$F#A$F$A$F-A%I#\'I#A$I$ I$\'A#&A\')A/J+L$^\';=A&\'I$\'F) F$ F8 F1A#\'&G$I% G$ G%A(G# F$ F#A#F#G#A#J+A(9L(=&\'I#9F) F$ F8 F+ F&A#\'&)\'I& \'I# I#G#A(I#A&F$ F#G#A#J+ F#)A-G#I#F* F$ FJG#&I$G% I$ I$\'&=A%F$)L(F$G#A#J+L*=F\' \'I# F3A$F9 F* &A#F(A$\'A%I$G$ \' I)A\'J+A#I#9A-FQ\'F#G(A%;F\'%G)9J+Y#AFF# & F& F9 & F+\'F#G*&A#F& % G( J+A#F%AA&^$Y0=9^$G#^\'J"
    + "+L+=\'=\'=\'6767I#F) FEA%G/)G&9G#F&G, GE ^)\'^\' ^#Y&^%Y#AFFLI#G%)G\')G#I#G#&J+Y\'F\'I#G#F%G$&I$F#I(F$G%F.\'I#G#I\'\'&)J+I$\'^#BG !A&!A#CL9%C$b&*&  F%A#F( & F%A#FJ F%A#FB F%A#F( & F%A#F0 FZ F%A#FeA#G$Y*L5A$F1^+A\'b!7! A#C\'A#5b&M* =9F2-F;67A$FmY$K$F)A(F3G$)A*F4G#)Y#A*F3G#A-F. F$ G#A-FUG#)G(I)\'I#G,Y$%Y$;&\'A#J+A\'L+A\'Y\'5Y%G$1\'J+A\'FD%FWA\'F&G#FC\'&A&FhA+F@ G$I%G#I$A%I#\'I\'G$A%=A$Y#J+F?A#F&A,FMA%F;A\'J+,A$^CF8G#I#\'A#Y#FV)\')G( \')\'I#G)I\'G+A#\'J+A\'J+A\'Y(%Y\'A#G/(GSA0G%)FP\')G&)\'I&\'I#F) Y#J+Y(^+G*^*Y$G#)F?)G%I#G#)G$F#J+FM\')G#I$\')G$I#A)Y"
    + "%FEI)G)I#G#A$Y&J+A$F$J+F?E\'Y#C*!#A&BLA#B$Y)A)G$9G.)G(F%\'F\'\'F#)G#&A&CMEaC.%CCEFGb!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!C*!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!C*B)C\'A#B\'A#C)B)C)B)C\'A#B\'A#C) ! ! ! !C)B)C/A#C)D)C)D)C)D)C& C#B%$<#]$C$ C#B%$]$C%A#C#B% ]$C)B&]$A#C$ C#B%$]# M,Q&U\'Y#>?6_#?6>Y)./Q&-Y*>?Y%X#Y$:67Y,:98Y+-Q& Q+,%A#L\'Z$67%L+Z$67E2[FA,G."
    + "H%\'H$G-A0^#!^%!^##B$C#B$#=!^#:B&^\'!=!=!=B%=#B%#F%#^#C#B#Z&!C%=:^##=L1KD!#K%,^#A%Z&^&Z#^%:^#:^#:^(:^@Z#^#:=:^@b:-% ^)6767^5Z#^(67b=2! :^?Z:^IZ\'^jA7^,A6L^^pL7b=X# :^*:^WZ)b=P! :b=Y$ 67676767676767L?^MZ&67Z@6767676767Z1b= % b:$# 6767676767676767676767Za6767ZA67b:#% ^QZ6^#Z\'^HA#b=+# BQCQ!#B$C#!#!#!#B%#!C#!C\'E#B$#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!C#^\'!#!#G$!#A&Y%,Y#CG #A&#A#FYA(%9A/\'F8A*F( F( F( F( F( F( F( F( GAY#>?>?Y$>?9>?Y*5Y#59>?Y#>?67676767Y&%Y"
    + "+U#Y%596Y.^#Y$676767675A#Y#67A=^; b=:! A-b=7$ A;^1-Y$=%&+6767676767^#6767676756W#=K*G%I#5E&^#K$%&9^# b&7! A#G#]#E#&5b&;! 9E$&A&FL b&?!  ^#L%^+FA^GA*=F1^@ L+^?L)=L0^AL+^HL0b= & b& H!^bb&  %b&6)!%b&X2 A$^XA*FIE\'Y#b&-% %Y$F1J+F#A5!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#&\'H$9G+9%!#!#!#!#!#!#!#!#!#!#!#!#!#!#E#G#FhK+G#Y\'A)]8E*]#!#!#!#!#!#!#!C$!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#%C)!#!#B##!#!#!#!#%]#!#!#&!#!C$!#!#!#!#!#!#!#!#!#!#B&#B&#!#!#!#!#!#!#!#B%#!#B##!#!#!#!#!#!#!#B#A%!A/E%!#&"
    + "E##F(\'F$\'F%\'F8I#G#)^%\'A$L\'^#;=A\'FUY%A)I#FSI1G#A)Y#J+A\'G3F\'Y$&9F#\'J+F=G)Y#F8G,I#A,9F>A$G$)FP\'I#G%I#G#I$Y. %J+A%Y#F&\'%F*J+F& FJG\'I#G#I#G#A*F$\'F)\')A#J+A#Y%F1%F\'^$&)\')FS\'&G$F#G#F&G#&\'&A9F#%Y#F,)G#I#Y#&E#)\'A+F\'A#F\'A#F\'A*F( F( CL<E%C*%]#B#A#b#1! FDI#\'I#\'I#9)\'A#J+A\'b&EO#A-F8A%FRA%b4 A b3 E!b&O& A#b&K! AGC(A-C&A&&\'F+:F. F& & F# F# b&M! ]2^1b&L& 76^1Fb^#FW^)AAF-;^$G1Y(679A\'G19U#X#6767676767676767Y#67Y%X$Y$ Y%5676767Y$:5Z$ 9;Y#A%F& b&(# A#1 Y$;Y$679:95Y#J+Y#Z$Y#B;697<8<C;6:7:67967Y#F+%FNE#F@A$F\'A#F\'A#F\'A#F$A$[#:<=[# "
    + "=Z%^#A+Q$^#A#F- F; F4 F# F0A#F/ACb&]! A&Y$A%LNA$^*KVL%^2L#^$ ^.A$=AP^N\'b ## F>A$FRA0\'L<A%FAL%A*F5+F)+A&FGG&A&F? 9FEA%F)9K&AKBICIFpA#J+A\'BEA%CEA%FIA)FUA,9B, B0 B( B# C, C0 C( C#A$FUA-b&X% A*F7A+F)A9E\' EK E/AbF\'A#& FM F#A$&A#F8 9L)F8^#L(F@A)L*AQF4 F#A&L&F7L\'A$9F;A&9F;AGFYA%L#F#L1A#LO&G$ G#A&G%F% F$ F>A#G$A%\'L*A(Y*A(F>L#9F>L$AAF)=F=G#A%L&Y(A*FWA$Y(F7A#L)F4A&L)F3A(Y%A-L(b 1! FkAXBTA.CTA(L\'FEG%A)J+A\'J+F%%&B7A$G&5%C7A)Z#b 1$ L@ FK G#5A#F#A1F$%F# ]#G&9^)F7 G1F>L+&A)F7G,L%Y&A7F3G%Y%AGF6L(A5F8A*)\')FVG0Y(A%L5J+\'F#G#&"
    + "A*G$)FNI$G%I#G#Y#1Y%\'A+1A#F:A(J+A\'G$FEG&)G) J+Y%&I#&A)FD\'Y#&A*G#)FQI$G*I#F%Y%G%9)\'J+&9&Y$ L5A,F3 F:I$G$I#\')G#Y\'\'F#\'A`F( & F% F0 F+9A\'FP\'I$G)A&J+A\'G#I# F)A#F#A#F7 F( F# F& G#&I#\'I%A#I#A#I$A#&A\')A&F&I#A#G(A$G&A,F+ &A#& FG &I$G\' )A#) I% I#\')\'&\'&Y# Y#A)G#A>FVI$G)I#G$)\'F%Y&J+Y# 9\'F$A?FQI$G\')\'I%G#)G#F#9&A)J+b G# FPI$G%A#I%G#)G#Y8F%G#ACFQI$G)I#\')G#Y$&A,J+A\'Y.A4FL\')\'I#G\')\'&9A\'J+A\'J5A=F<A#\')\'I#G%)G&A%J+L#Y$=F(b Z# FMI$G*)G#9b E! BACAJ+L*A-F)A#&A#F) F# F9I\' I#A#G#)\'&)&)\'Y$A*J+AhF)A#FHI$G%A#G#I%\'&9&)A<&G+FIG\')&G%Y)\'A)"
    + "&G\'I#G$FOG.)G#Y$&Y&A.FkA(Y+&b 6! \')G$)\')b 9! FB9A/J+A\'F* FF)G( G\')\'&Y&A+J+L4A$Y#F?A#G7 )G()G#)G#AkF( F# FGG\'A$\' G# G(&\'A)J+A\'F\' F# FAI& G# I#\')\'&A(J+A\'FJ%F#A%J+b W$ F4G#I#Y#A(G#&)F. FCI#G&A$I#\')\'Y.J+\'b 6! &A0L6^)[%^2A.9b&;/ b G! b+Q! Y&K,b&%$ A-b+X% b *E b&B! Y#A.b&Q1 Q1\'F\'G0A+b&<` A&b&(* b ZK!F?G-I$G$J+b \'< b&Z) A(F@ J+A%Y#Fq J+A\'F?A#G&9A+FQG(Y&^%E%9=A+J+ L( F6A&F4b Q\' E$FIE#Y$J+A\'F9\'F%\'A#J+b 7# BACAL8Y%A&B:A#C:AMFmA%\'&IXA(G%E.AbE#9%\'A,I#E#K$A*b&<T!AEFCb @! b&T! A.b&3/ A/FTb >Y!E% E( E# b&J% A*&A>F$A#&A/F&"
    + "A(b&-\' b %E b&L! A&F.A$F*A(F+A#=G#9Q%b =_ b=Q$ J+^$A$b=U\' A\'^8 ^$A)Z$^1Z/A#GOA#G8A*b=U! A^b=W$ A+^HG#^^I#G$^$I\'Q)G)^#G(^?G%b=5# G$=A+I$^)G#^#)^AI#A`L5A-L5A-b=8! A*L:b (# B;C;B;C( C3B;C;! B#A#!A#B#A#B% B)C% # C( C,B;C;B# B%A#B) B( C;B# B% B& !A$B( C;B;C;B;C;B;C;B;C;B;C;B;C> B::C::C\'B::C::C\'B::C::C\'B::C::C\'B::C::C\'!#A#JSb= ) GX^%GS^)\'^/\'^#Y&A0G& G0b 1! Z>b D0 C+&CV!C(!#!C#!C$!C7!#!#!#!C$!#!#!#!#!#!#!#F#A/C(AWETG( G2A#G( G# G&A&E`AB\'b Q! FNA$G(E(A#J+A%&=b  & F?\'A2FMG%J+A&;b 1( F<%G%J+b 7$ F?G#&J+A%9b  $ F@ F$\'"
    + "F#\'F(G#F&\'A)&%b A$ F( F% F# F0 b&&$ A#L*G(AJBCCCG(%A%J+A%Y#b 2- L]=L$;L%AnLN=L0b #$ F% F< F# &A#& F+ F% & &A\'&A%& & & F$ F# &A#& & & & & F# &A#F% F( F% F% & F+ F2A&F$ F& F2AUZ#b /% ^MA%b=E! A-^0A#^0 ^0 ^FA+L.b=C# AX^>A.^MA%^*A(^#A/^\'b ;# b=]$ ]&b=;, A#^2A$^.A$b==$ A%^-A%^=A%^YA)^+A\'^IA)^?A#^-A%^#A/Z*AHb=9& A)^/A#^.A$^i =A$^3 ^.A$^-A&b=4#  b==! J+=b &1 b&  %b&  %b&A<#AAb&@%! b&/;!A#b&RU!A0b&O* b CG b&?) b C8 b&,.!A&b&K%#b   %b   %b \'O!b& R#b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   "
    + "%b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b   %b !0 1A?b1A! b  # b\'Q$ b   %b   %b   %b 1Y$b3  %b3  %b3  %b3`a$A#b3  %b3  %b3  %b3`a$"};
},
otrr_ReflectionInfo = $rt_classWithoutFields();
function c_CompletableFuture$thenAccept$lambda$_10_0() {
    jl_Object.call(this);
    this.$_0 = null;
}
let c_CompletableFuture$thenAccept$lambda$_10_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_0 = var$1;
},
c_CompletableFuture$thenAccept$lambda$_10_0__init_0 = var_0 => {
    let var_1 = new c_CompletableFuture$thenAccept$lambda$_10_0();
    c_CompletableFuture$thenAccept$lambda$_10_0__init_(var_1, var_0);
    return var_1;
},
c_CompletableFuture$thenAccept$lambda$_10_0_apply0 = (var$0, var$1) => {
    return c_CompletableFuture$thenAccept$lambda$_10_0_apply(var$0, var$1);
},
c_CompletableFuture$thenAccept$lambda$_10_0_apply = (var$0, var$1) => {
    return c_CompletableFuture_lambda$thenAccept$4(var$0.$_0, var$1);
};
function d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12() {
    jl_Object.call(this);
    this.$_04 = null;
}
let d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_04 = var$1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$12(var$0.$_04);
};
function d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11() {
    jl_Object.call(this);
    this.$_018 = null;
}
let d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_018 = var$1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$11(var$0.$_018);
};
function jl_Enum() {
    let a = this; jl_Object.call(a);
    a.$name1 = null;
    a.$ordinal = 0;
}
let jl_Enum__init_ = ($this, $name, $ordinal) => {
    jl_Object__init_($this);
    $this.$name1 = $name;
    $this.$ordinal = $ordinal;
},
mr_Room$RoomType = $rt_classWithoutFields(jl_Enum),
mr_Room$RoomType_PUBLIC = null,
mr_Room$RoomType_PRIVATE = null,
mr_Room$RoomType_$VALUES = null,
mr_Room$RoomType_$callClinit = () => {
    mr_Room$RoomType_$callClinit = $rt_eraseClinit(mr_Room$RoomType);
    mr_Room$RoomType__clinit_();
},
mr_Room$RoomType__init_0 = ($this, var$1, var$2) => {
    mr_Room$RoomType_$callClinit();
    jl_Enum__init_($this, var$1, var$2);
},
mr_Room$RoomType__init_ = (var_0, var_1) => {
    let var_2 = new mr_Room$RoomType();
    mr_Room$RoomType__init_0(var_2, var_0, var_1);
    return var_2;
},
mr_Room$RoomType_$values = () => {
    let var$1, var$2;
    mr_Room$RoomType_$callClinit();
    var$1 = $rt_createArray(mr_Room$RoomType, 2);
    var$2 = var$1.data;
    var$2[0] = mr_Room$RoomType_PUBLIC;
    var$2[1] = mr_Room$RoomType_PRIVATE;
    return var$1;
},
mr_Room$RoomType__clinit_ = () => {
    mr_Room$RoomType_PUBLIC = mr_Room$RoomType__init_($rt_s(78), 0);
    mr_Room$RoomType_PRIVATE = mr_Room$RoomType__init_($rt_s(79), 1);
    mr_Room$RoomType_$VALUES = mr_Room$RoomType_$values();
};
function d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10() {
    jl_Object.call(this);
    this.$_029 = null;
}
let d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_029 = var$1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$10(var$0.$_029);
};
function a_Component$bindKeyboard$lambda$_23_3() {
    jl_Object.call(this);
    this.$_08 = null;
}
let a_Component$bindKeyboard$lambda$_23_3__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_08 = var$1;
},
a_Component$bindKeyboard$lambda$_23_3__init_0 = var_0 => {
    let var_1 = new a_Component$bindKeyboard$lambda$_23_3();
    a_Component$bindKeyboard$lambda$_23_3__init_(var_1, var_0);
    return var_1;
},
a_Component$bindKeyboard$lambda$_23_3_handleEvent = (var$0, var$1) => {
    a_Component_lambda$bindKeyboard$11(var$0.$_08, var$1);
},
a_Component$bindKeyboard$lambda$_23_3_handleEvent$exported$0 = (var$1, var$2) => {
    var$1.$handleEvent0(var$2);
};
function ae_ComponentEvent() {
    jl_Object.call(this);
    this.$source0 = null;
}
let ae_ComponentEvent__init_ = ($this, $source) => {
    jl_Object__init_($this);
    $this.$source0 = $source;
},
ae_ComponentEvent__init_0 = var_0 => {
    let var_1 = new ae_ComponentEvent();
    ae_ComponentEvent__init_(var_1, var_0);
    return var_1;
};
function c_CompletedFuture() {
    let a = this; jl_Object.call(a);
    a.$value2 = null;
    a.$failure0 = null;
}
let c_CompletedFuture__init_ = ($this, $value) => {
    jl_Object__init_($this);
    $this.$value2 = $value;
    $this.$failure0 = null;
},
c_CompletedFuture__init_1 = var_0 => {
    let var_1 = new c_CompletedFuture();
    c_CompletedFuture__init_(var_1, var_0);
    return var_1;
},
c_CompletedFuture__init_0 = ($this, $failure) => {
    jl_Object__init_($this);
    $this.$value2 = null;
    $this.$failure0 = $failure;
},
c_CompletedFuture__init_2 = var_0 => {
    let var_1 = new c_CompletedFuture();
    c_CompletedFuture__init_0(var_1, var_0);
    return var_1;
},
c_CompletedFuture_get = $this => {
    if ($this.$failure0 === null)
        return $this.$value2;
    $rt_throw($this.$failure0);
},
c_CompletedFuture_isDone = $this => {
    return 1;
};
function ae_MouseEvent() {
    let a = this; jl_Object.call(a);
    a.$x3 = 0;
    a.$y3 = 0;
    a.$button = 0;
    a.$clickCount = 0;
    a.$shift0 = 0;
    a.$ctrl = 0;
    a.$alt = 0;
    a.$meta0 = 0;
    a.$source2 = null;
    a.$consumed0 = 0;
}
let ae_MouseEvent__init_ = ($this, $source, $x, $y, $button, $clickCount, $shift, $ctrl, $alt, $meta) => {
    jl_Object__init_($this);
    $this.$consumed0 = 0;
    $this.$source2 = $source;
    $this.$x3 = $x;
    $this.$y3 = $y;
    $this.$button = $button;
    $this.$clickCount = $clickCount;
    $this.$shift0 = $shift;
    $this.$ctrl = $ctrl;
    $this.$alt = $alt;
    $this.$meta0 = $meta;
},
ae_MouseEvent__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8) => {
    let var_9 = new ae_MouseEvent();
    ae_MouseEvent__init_(var_9, var_0, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8);
    return var_9;
},
ae_MouseEvent_getX = $this => {
    return $this.$x3;
},
ae_MouseEvent_getY = $this => {
    return $this.$y3;
};
function ae_MouseWheelEvent() {
    let a = this; ae_MouseEvent.call(a);
    a.$wheelRotation = 0;
    a.$preciseRotation = 0.0;
}
let ae_MouseWheelEvent__init_ = ($this, $source, $x, $y, $rotation, $precise, $shift, $ctrl, $alt, $meta) => {
    ae_MouseEvent__init_($this, $source, $x, $y, 0, 0, $shift, $ctrl, $alt, $meta);
    $this.$wheelRotation = $rotation;
    $this.$preciseRotation = $precise;
},
ae_MouseWheelEvent__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8) => {
    let var_9 = new ae_MouseWheelEvent();
    ae_MouseWheelEvent__init_(var_9, var_0, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8);
    return var_9;
},
ae_MouseWheelEvent_getWheelRotation = $this => {
    return $this.$wheelRotation;
},
jl_Double = $rt_classWithoutFields(jl_Number),
jl_Double_TYPE = null,
jl_Double_$callClinit = () => {
    jl_Double_$callClinit = $rt_eraseClinit(jl_Double);
    jl_Double__clinit_();
},
jl_Double_isInfinite = $v => {
    jl_Double_$callClinit();
    return !(isFinite($v) ? 1 : 0) && !(isNaN($v) ? 1 : 0) ? 1 : 0;
},
jl_Double_doubleToLongBits = $value => {
    jl_Double_$callClinit();
    if (!(isNaN($value) ? 1 : 0))
        return $rt_doubleToRawLongBits($value);
    return Long_create(0, 2146959360);
},
jl_Double__clinit_ = () => {
    jl_Double_TYPE = $rt_cls($rt_doublecls);
},
ju_List = $rt_classWithoutFields(0);
function ju_AbstractList() {
    ju_AbstractCollection.call(this);
    this.$modCount = 0;
}
let ju_AbstractList__init_ = $this => {
    ju_AbstractCollection__init_($this);
},
ju_AbstractList_iterator = $this => {
    return ju_AbstractList$1__init_0($this);
},
ju_RandomAccess = $rt_classWithoutFields(0);
function ju_ArrayList() {
    let a = this; ju_AbstractList.call(a);
    a.$array = null;
    a.$size0 = 0;
}
let ju_ArrayList__init_1 = $this => {
    ju_ArrayList__init_0($this, 10);
},
ju_ArrayList__init_ = () => {
    let var_0 = new ju_ArrayList();
    ju_ArrayList__init_1(var_0);
    return var_0;
},
ju_ArrayList__init_0 = ($this, $initialCapacity) => {
    ju_AbstractList__init_($this);
    if ($initialCapacity >= 0) {
        $this.$array = $rt_createArray(jl_Object, $initialCapacity);
        return;
    }
    $rt_throw(jl_IllegalArgumentException__init_());
},
ju_ArrayList__init_2 = var_0 => {
    let var_1 = new ju_ArrayList();
    ju_ArrayList__init_0(var_1, var_0);
    return var_1;
},
ju_ArrayList_ensureCapacity = ($this, $minCapacity) => {
    let $newLength;
    if ($this.$array.data.length < $minCapacity) {
        $newLength = $this.$array.data.length >= 1073741823 ? 2147483647 : jl_Math_max($minCapacity, jl_Math_max($this.$array.data.length * 2 | 0, 5));
        $this.$array = ju_Arrays_copyOf0($this.$array, $newLength);
    }
},
ju_ArrayList_get = ($this, $index) => {
    ju_ArrayList_checkIndex($this, $index);
    return $this.$array.data[$index];
},
ju_ArrayList_size = $this => {
    return $this.$size0;
},
ju_ArrayList_add = ($this, $element) => {
    let var$2, var$3;
    $this.$ensureCapacity($this.$size0 + 1 | 0);
    var$2 = $this.$array.data;
    var$3 = $this.$size0;
    $this.$size0 = var$3 + 1 | 0;
    var$2[var$3] = $element;
    $this.$modCount = $this.$modCount + 1 | 0;
    return 1;
},
ju_ArrayList_clear = $this => {
    ju_Arrays_fill($this.$array, 0, $this.$size0, null);
    $this.$size0 = 0;
    $this.$modCount = $this.$modCount + 1 | 0;
},
ju_ArrayList_checkIndex = ($this, $index) => {
    if ($index >= 0 && $index < $this.$size0)
        return;
    $rt_throw(jl_IndexOutOfBoundsException__init_0());
};
function jl_String() {
    jl_Object.call(this);
    this.$hashCode0 = 0;
}
let jl_String_EMPTY_CHARS = null,
jl_String_EMPTY = null,
jl_String_CASE_INSENSITIVE_ORDER = null,
jl_String_$callClinit = () => {
    jl_String_$callClinit = $rt_eraseClinit(jl_String);
    jl_String__clinit_();
},
jl_String__init_1 = $this => {
    jl_String_$callClinit();
    jl_Object__init_($this);
    $this.$nativeString = "";
},
jl_String__init_3 = () => {
    let var_0 = new jl_String();
    jl_String__init_1(var_0);
    return var_0;
},
jl_String__init_ = ($this, $characters) => {
    let var$2;
    jl_String_$callClinit();
    var$2 = $characters.data;
    jl_Object__init_($this);
    $this.$nativeString = $rt_charArrayToString($characters.data, 0, var$2.length);
},
jl_String__init_5 = var_0 => {
    let var_1 = new jl_String();
    jl_String__init_(var_1, var_0);
    return var_1;
},
jl_String__init_2 = (var$0, var$1) => {
    var$0.$nativeString = var$1;
},
jl_String__init_0 = var_0 => {
    let var_1 = new jl_String();
    jl_String__init_2(var_1, var_0);
    return var_1;
},
jl_String__init_4 = (var$0, var$1, $offset, $count) => {
    let var$4;
    jl_String_$callClinit();
    var$4 = var$1.data;
    jl_Object__init_(var$0);
    ju_Objects_checkFromIndexSize($offset, $count, var$4.length);
    var$0.$nativeString = $rt_charArrayToString(var$1.data, $offset, $count);
},
jl_String__init_6 = (var_0, var_1, var_2) => {
    let var_3 = new jl_String();
    jl_String__init_4(var_3, var_0, var_1, var_2);
    return var_3;
},
jl_String_fromArray = $characters => {
    let $s;
    jl_String_$callClinit();
    $s = jl_String__init_3();
    $s.$nativeString = $rt_fullArrayToString($characters.data);
    return $s;
},
jl_String_charAt = ($this, $index) => {
    if ($index >= 0 && $index < $this.$nativeString.length)
        return $this.$nativeString.charCodeAt($index);
    $rt_throw(jl_StringIndexOutOfBoundsException__init_());
},
jl_String_length = $this => {
    return $this.$nativeString.length;
},
jl_String_isEmpty = $this => {
    return $this.$nativeString.length ? 0 : 1;
},
jl_String_startsWith0 = ($this, $prefix, $toffset) => {
    let $i, var$4, var$5;
    if (($toffset + jl_String_length($prefix) | 0) > jl_String_length($this))
        return 0;
    $i = 0;
    while ($i < jl_String_length($prefix)) {
        var$4 = jl_String_charAt($prefix, $i);
        var$5 = $toffset + 1 | 0;
        if (var$4 != jl_String_charAt($this, $toffset))
            return 0;
        $i = $i + 1 | 0;
        $toffset = var$5;
    }
    return 1;
},
jl_String_startsWith = ($this, $prefix) => {
    if ($this === $prefix)
        return 1;
    return jl_String_startsWith0($this, $prefix, 0);
},
jl_String_indexOf0 = ($this, $ch, $fromIndex) => {
    let $i, $bmpChar, $hi, $lo;
    $i = jl_Math_max(0, $fromIndex);
    if ($ch < 65536) {
        $bmpChar = $ch & 65535;
        while (true) {
            if ($i >= $this.$nativeString.length)
                return (-1);
            if ($this.$nativeString.charCodeAt($i) == $bmpChar)
                break;
            $i = $i + 1 | 0;
        }
        return $i;
    }
    $hi = jl_Character_highSurrogate($ch);
    $lo = jl_Character_lowSurrogate($ch);
    while (true) {
        if ($i >= ($this.$nativeString.length - 1 | 0))
            return (-1);
        if ($this.$nativeString.charCodeAt($i) == $hi && $this.$nativeString.charCodeAt(($i + 1 | 0)) == $lo)
            break;
        $i = $i + 1 | 0;
    }
    return $i;
},
jl_String_indexOf = ($this, $ch) => {
    return jl_String_indexOf0($this, $ch, 0);
},
jl_String_lastIndexOf0 = ($this, $ch, $fromIndex) => {
    let $i, $bmpChar, $hi, $lo, var$7;
    $i = jl_Math_min($fromIndex, jl_String_length($this) - 1 | 0);
    if ($ch < 65536) {
        $bmpChar = $ch & 65535;
        while (true) {
            if ($i < 0)
                return (-1);
            if ($this.$nativeString.charCodeAt($i) == $bmpChar)
                break;
            $i = $i + (-1) | 0;
        }
        return $i;
    }
    $hi = jl_Character_highSurrogate($ch);
    $lo = jl_Character_lowSurrogate($ch);
    while (true) {
        if ($i < 1)
            return (-1);
        if ($this.$nativeString.charCodeAt($i) == $lo) {
            var$7 = $i - 1 | 0;
            if ($this.$nativeString.charCodeAt(var$7) == $hi)
                break;
        }
        $i = $i + (-1) | 0;
    }
    return var$7;
},
jl_String_lastIndexOf = ($this, $ch) => {
    return jl_String_lastIndexOf0($this, $ch, jl_String_length($this) - 1 | 0);
},
jl_String_substring = ($this, $beginIndex, $endIndex) => {
    let $length, var$4;
    $length = $this.$nativeString.length;
    var$4 = $rt_compare($beginIndex, $endIndex);
    if (!var$4)
        return jl_String_EMPTY;
    if (!$beginIndex && $endIndex == $length)
        return $this;
    if ($beginIndex >= 0 && var$4 <= 0 && $endIndex <= $length)
        return jl_String__init_0($this.$nativeString.substring($beginIndex, $endIndex));
    $rt_throw(jl_StringIndexOutOfBoundsException__init_());
},
jl_String_substring0 = ($this, $beginIndex) => {
    return jl_String_substring($this, $beginIndex, jl_String_length($this));
},
jl_String_subSequence = ($this, $beginIndex, $endIndex) => {
    return jl_String_substring($this, $beginIndex, $endIndex);
},
jl_String_concat = ($this, $str) => {
    let $buffer, $index, $i, var$5, var$6;
    if (jl_String_isEmpty($str))
        return $this;
    if (jl_String_isEmpty($this))
        return $str;
    $buffer = $rt_createCharArray(jl_String_length($this) + jl_String_length($str) | 0);
    $index = 0;
    $i = 0;
    while ($i < jl_String_length($this)) {
        var$5 = $buffer.data;
        var$6 = $index + 1 | 0;
        var$5[$index] = jl_String_charAt($this, $i);
        $i = $i + 1 | 0;
        $index = var$6;
    }
    $i = 0;
    while ($i < jl_String_length($str)) {
        var$5 = $buffer.data;
        var$6 = $index + 1 | 0;
        var$5[$index] = jl_String_charAt($str, $i);
        $i = $i + 1 | 0;
        $index = var$6;
    }
    return jl_String_fromArray($buffer);
},
jl_String_contains = ($this, $s) => {
    let $sz, $i, $j;
    $sz = jl_String_length($this) - $s.$length() | 0;
    $i = 0;
    while ($i <= $sz) {
        $j = 0;
        while (true) {
            if ($j >= $s.$length())
                return 1;
            if (jl_String_charAt($this, $i + $j | 0) != $s.$charAt($j))
                break;
            $j = $j + 1 | 0;
        }
        $i = $i + 1 | 0;
    }
    return 0;
},
jl_String_toString = $this => {
    return $this;
},
jl_String_toCharArray = $this => {
    let $array, $i, var$3;
    $array = $rt_createCharArray($this.$nativeString.length);
    $i = 0;
    while (true) {
        var$3 = $array.data;
        if ($i >= var$3.length)
            break;
        var$3[$i] = jl_String_charAt($this, $i);
        $i = $i + 1 | 0;
    }
    return $array;
},
jl_String_valueOf = $obj => {
    jl_String_$callClinit();
    return $obj === null ? $rt_s(17) : $obj.$toString();
},
jl_String_valueOf0 = $c => {
    let var$2, var$3;
    jl_String_$callClinit();
    var$2 = new jl_String;
    var$3 = $rt_createCharArray(1);
    var$3.data[0] = $c;
    jl_String__init_(var$2, var$3);
    return var$2;
},
jl_String_equals = ($this, $other) => {
    let $str;
    if ($this === $other)
        return 1;
    if (!($other instanceof jl_String))
        return 0;
    $str = $other;
    return $this.$nativeString !== $str.$nativeString ? 0 : 1;
},
jl_String_hashCode = $this => {
    let $i;
    a: {
        if (!$this.$hashCode0) {
            $i = 0;
            while (true) {
                if ($i >= $this.$nativeString.length)
                    break a;
                $this.$hashCode0 = (31 * $this.$hashCode0 | 0) + $this.$nativeString.charCodeAt($i) | 0;
                $i = $i + 1 | 0;
            }
        }
    }
    return $this.$hashCode0;
},
jl_String_toUpperCase = $this => {
    let $upperCase;
    $upperCase = $this.$nativeString.toUpperCase();
    if ($upperCase !== $this.$nativeString)
        $this = jl_String__init_0($upperCase);
    return $this;
},
jl_String__clinit_ = () => {
    jl_String_EMPTY_CHARS = $rt_createCharArray(0);
    jl_String_EMPTY = jl_String__init_3();
    jl_String_CASE_INSENSITIVE_ORDER = jl_String$_clinit_$lambda$_118_0__init_0();
};
function a_BasicStroke() {
    let a = this; jl_Object.call(a);
    a.$width1 = 0.0;
    a.$cap = 0;
    a.$join0 = 0;
}
let a_BasicStroke__init_2 = ($this, $w) => {
    a_BasicStroke__init_0($this, $w, 2, 0);
},
a_BasicStroke__init_ = var_0 => {
    let var_1 = new a_BasicStroke();
    a_BasicStroke__init_2(var_1, var_0);
    return var_1;
},
a_BasicStroke__init_0 = ($this, $w, $cap, $join) => {
    jl_Object__init_($this);
    $this.$width1 = $w;
    $this.$cap = $cap;
    $this.$join0 = $join;
},
a_BasicStroke__init_1 = (var_0, var_1, var_2) => {
    let var_3 = new a_BasicStroke();
    a_BasicStroke__init_0(var_3, var_0, var_1, var_2);
    return var_3;
},
a_BasicStroke_getLineWidth = $this => {
    return $this.$width1;
},
a_BasicStroke_capCss = $this => {
    return $this.$cap == 1 ? $rt_s(80) : $this.$cap != 2 ? $rt_s(81) : $rt_s(82);
},
a_BasicStroke_joinCss = $this => {
    return $this.$join0 == 1 ? $rt_s(80) : $this.$join0 != 2 ? $rt_s(83) : $rt_s(84);
};
function ag_RoundRectangle2D$Float() {
    let a = this; ag_RoundRectangle2D.call(a);
    a.$x4 = 0.0;
    a.$y4 = 0.0;
    a.$width5 = 0.0;
    a.$height4 = 0.0;
    a.$arcwidth0 = 0.0;
    a.$archeight = 0.0;
}
let ag_RoundRectangle2D$Float__init_ = ($this, $x, $y, $w, $h, $aw, $ah) => {
    ag_RoundRectangle2D__init_($this);
    $this.$x4 = $x;
    $this.$y4 = $y;
    $this.$width5 = $w;
    $this.$height4 = $h;
    $this.$arcwidth0 = $aw;
    $this.$archeight = $ah;
},
ag_RoundRectangle2D$Float__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5) => {
    let var_6 = new ag_RoundRectangle2D$Float();
    ag_RoundRectangle2D$Float__init_(var_6, var_0, var_1, var_2, var_3, var_4, var_5);
    return var_6;
},
ag_RoundRectangle2D$Float_x = $this => {
    return $this.$x4;
},
ag_RoundRectangle2D$Float_y = $this => {
    return $this.$y4;
},
ag_RoundRectangle2D$Float_w = $this => {
    return $this.$width5;
},
ag_RoundRectangle2D$Float_h = $this => {
    return $this.$height4;
},
ag_RoundRectangle2D$Float_arcW = $this => {
    return $this.$arcwidth0;
},
ag_RoundRectangle2D$Float_arcH = $this => {
    return $this.$archeight;
},
jl_NegativeArraySizeException = $rt_classWithoutFields(jl_RuntimeException),
jl_NegativeArraySizeException__init_ = $this => {
    jl_RuntimeException__init_($this);
},
jl_NegativeArraySizeException__init_0 = () => {
    let var_0 = new jl_NegativeArraySizeException();
    jl_NegativeArraySizeException__init_(var_0);
    return var_0;
},
a_RenderingHints = $rt_classWithoutFields(),
a_RenderingHints_KEY_ANTIALIASING = null,
a_RenderingHints_VALUE_ANTIALIAS_ON = null,
a_RenderingHints_VALUE_ANTIALIAS_OFF = null,
a_RenderingHints_KEY_STROKE_CONTROL = null,
a_RenderingHints_VALUE_STROKE_PURE = null,
a_RenderingHints_KEY_RENDERING = null,
a_RenderingHints_VALUE_RENDER_QUALITY = null,
a_RenderingHints_KEY_TEXT_ANTIALIASING = null,
a_RenderingHints_VALUE_TEXT_ANTIALIAS_ON = null,
a_RenderingHints_KEY_INTERPOLATION = null,
a_RenderingHints_VALUE_INTERPOLATION_BILINEAR = null,
a_RenderingHints_$callClinit = () => {
    a_RenderingHints_$callClinit = $rt_eraseClinit(a_RenderingHints);
    a_RenderingHints__clinit_();
},
a_RenderingHints__clinit_ = () => {
    a_RenderingHints_KEY_ANTIALIASING = $rt_s(85);
    a_RenderingHints_VALUE_ANTIALIAS_ON = $rt_s(86);
    a_RenderingHints_VALUE_ANTIALIAS_OFF = $rt_s(87);
    a_RenderingHints_KEY_STROKE_CONTROL = $rt_s(88);
    a_RenderingHints_VALUE_STROKE_PURE = $rt_s(89);
    a_RenderingHints_KEY_RENDERING = $rt_s(90);
    a_RenderingHints_VALUE_RENDER_QUALITY = $rt_s(91);
    a_RenderingHints_KEY_TEXT_ANTIALIASING = $rt_s(92);
    a_RenderingHints_VALUE_TEXT_ANTIALIAS_ON = $rt_s(86);
    a_RenderingHints_KEY_INTERPOLATION = $rt_s(93);
    a_RenderingHints_VALUE_INTERPOLATION_BILINEAR = $rt_s(94);
},
jl_UnsupportedOperationException = $rt_classWithoutFields(jl_RuntimeException),
jl_UnsupportedOperationException__init_ = ($this, $message) => {
    jl_RuntimeException__init_0($this, $message);
},
jl_UnsupportedOperationException__init_0 = var_0 => {
    let var_1 = new jl_UnsupportedOperationException();
    jl_UnsupportedOperationException__init_(var_1, var_0);
    return var_1;
},
d_WebSocketTest$run$lambda$_3_0 = $rt_classWithoutFields(),
d_WebSocketTest$run$lambda$_3_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_WebSocketTest$run$lambda$_3_0__init_0 = () => {
    let var_0 = new d_WebSocketTest$run$lambda$_3_0();
    d_WebSocketTest$run$lambda$_3_0__init_(var_0);
    return var_0;
},
d_WebSocketTest$run$lambda$_3_0_accept0 = (var$0, var$1) => {
    d_WebSocketTest$run$lambda$_3_0_accept(var$0, var$1);
},
d_WebSocketTest$run$lambda$_3_0_accept = (var$0, var$1) => {
    d_WebSocketTest_lambda$run$0(var$1);
};
function a_GradientPaint() {
    let a = this; jl_Object.call(a);
    a.$x10 = 0.0;
    a.$y10 = 0.0;
    a.$x20 = 0.0;
    a.$y20 = 0.0;
    a.$c1 = null;
    a.$c2 = null;
}
let a_GradientPaint__init_0 = ($this, $x1, $y1, $c1, $x2, $y2, $c2) => {
    jl_Object__init_($this);
    $this.$x10 = $x1;
    $this.$y10 = $y1;
    $this.$c1 = $c1;
    $this.$x20 = $x2;
    $this.$y20 = $y2;
    $this.$c2 = $c2;
},
a_GradientPaint__init_2 = (var_0, var_1, var_2, var_3, var_4, var_5) => {
    let var_6 = new a_GradientPaint();
    a_GradientPaint__init_0(var_6, var_0, var_1, var_2, var_3, var_4, var_5);
    return var_6;
},
a_GradientPaint__init_ = ($this, $x1, $y1, $c1, $x2, $y2, $c2) => {
    a_GradientPaint__init_0($this, $x1, $y1, $c1, $x2, $y2, $c2);
},
a_GradientPaint__init_1 = (var_0, var_1, var_2, var_3, var_4, var_5) => {
    let var_6 = new a_GradientPaint();
    a_GradientPaint__init_(var_6, var_0, var_1, var_2, var_3, var_4, var_5);
    return var_6;
},
jl_IllegalArgumentException = $rt_classWithoutFields(jl_RuntimeException),
jl_IllegalArgumentException__init_1 = $this => {
    jl_RuntimeException__init_($this);
},
jl_IllegalArgumentException__init_ = () => {
    let var_0 = new jl_IllegalArgumentException();
    jl_IllegalArgumentException__init_1(var_0);
    return var_0;
},
jl_IllegalArgumentException__init_2 = ($this, $message) => {
    jl_RuntimeException__init_0($this, $message);
},
jl_IllegalArgumentException__init_0 = var_0 => {
    let var_1 = new jl_IllegalArgumentException();
    jl_IllegalArgumentException__init_2(var_1, var_0);
    return var_1;
},
jl_NumberFormatException = $rt_classWithoutFields(jl_IllegalArgumentException),
jl_NumberFormatException__init_1 = $this => {
    jl_IllegalArgumentException__init_1($this);
},
jl_NumberFormatException__init_2 = () => {
    let var_0 = new jl_NumberFormatException();
    jl_NumberFormatException__init_1(var_0);
    return var_0;
},
jl_NumberFormatException__init_ = ($this, $message) => {
    jl_IllegalArgumentException__init_2($this, $message);
},
jl_NumberFormatException__init_0 = var_0 => {
    let var_1 = new jl_NumberFormatException();
    jl_NumberFormatException__init_(var_1, var_0);
    return var_1;
};
function a_Component$start$lambda$_15_0() {
    jl_Object.call(this);
    this.$_06 = null;
}
let a_Component$start$lambda$_15_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_06 = var$1;
},
a_Component$start$lambda$_15_0__init_0 = var_0 => {
    let var_1 = new a_Component$start$lambda$_15_0();
    a_Component$start$lambda$_15_0__init_(var_1, var_0);
    return var_1;
},
a_Component$start$lambda$_15_0_call = var$0 => {
    a_Component_frame(var$0.$_06);
},
a_Component$start$lambda$_15_0_call$exported$0 = var$1 => {
    var$1.$call();
},
vs_GroupIcon = $rt_classWithoutFields(),
vs_GroupIcon_draw = ($g, $x, $y, $size) => {
    vs_IconBase_paint($g, $x, $y, $size, vs_GroupIcon$draw$lambda$_1_0__init_0());
},
vs_GroupIcon_paint = $g => {
    let var$2, var$3;
    var$2 = ag_Ellipse2D$Double__init_0(34.0, 6.0, 20.0, 20.0);
    var$3 = ag_RoundRectangle2D$Double__init_0(28.0, 29.0, 32.0, 24.0, 22.0, 22.0);
    vs_IconBase_$callClinit();
    vs_GroupIcon_figure($g, var$2, var$3, vs_IconBase_GOLD_DARK);
    vs_GroupIcon_figure($g, ag_Ellipse2D$Double__init_0(9.0, 13.0, 24.0, 24.0), ag_RoundRectangle2D$Double__init_0(2.0, 39.0, 38.0, 26.0, 24.0, 24.0), vs_IconBase_GOLD);
},
vs_GroupIcon_figure = ($g, $head, $body, $fill) => {
    let $person;
    $person = ag_Area__init_($head);
    $person.$add0(ag_Area__init_($body));
    vs_IconBase_$callClinit();
    $g.$setColor(vs_IconBase_OUTLINE);
    $g.$setStroke(a_BasicStroke__init_1(9.0, 1, 1));
    $g.$draw($person);
    $g.$setColor($fill);
    $g.$fill1($person);
    $g.$setColor(vs_IconBase_OUTLINE);
    $g.$setStroke(a_BasicStroke__init_1(3.0, 1, 1));
    $g.$draw($person);
},
jl_IllegalStateException = $rt_classWithoutFields(jl_RuntimeException),
jl_IllegalStateException__init_0 = ($this, $message) => {
    jl_RuntimeException__init_0($this, $message);
},
jl_IllegalStateException__init_ = var_0 => {
    let var_1 = new jl_IllegalStateException();
    jl_IllegalStateException__init_0(var_1, var_0);
    return var_1;
},
jl_NullPointerException = $rt_classWithoutFields(jl_RuntimeException),
jl_NullPointerException__init_1 = ($this, $message) => {
    jl_RuntimeException__init_0($this, $message);
},
jl_NullPointerException__init_2 = var_0 => {
    let var_1 = new jl_NullPointerException();
    jl_NullPointerException__init_1(var_1, var_0);
    return var_1;
},
jl_NullPointerException__init_0 = $this => {
    jl_RuntimeException__init_($this);
},
jl_NullPointerException__init_ = () => {
    let var_0 = new jl_NullPointerException();
    jl_NullPointerException__init_0(var_0);
    return var_0;
};
function ag_PathSink$Recording() {
    jl_Object.call(this);
    this.$segs = null;
}
let ag_PathSink$Recording__init_ = $this => {
    jl_Object__init_($this);
    $this.$segs = ju_ArrayList__init_();
},
ag_PathSink$Recording__init_0 = () => {
    let var_0 = new ag_PathSink$Recording();
    ag_PathSink$Recording__init_(var_0);
    return var_0;
},
ag_PathSink$Recording_moveTo = ($this, $x, $y) => {
    $this.$segs.$add($rt_createDoubleArrayFromData([0.0, $x, $y, 0.0, 0.0, 0.0, 0.0]));
},
ag_PathSink$Recording_lineTo = ($this, $x, $y) => {
    $this.$segs.$add($rt_createDoubleArrayFromData([1.0, $x, $y, 0.0, 0.0, 0.0, 0.0]));
},
ag_PathSink$Recording_quadTo = ($this, $cx, $cy, $x, $y) => {
    $this.$segs.$add($rt_createDoubleArrayFromData([2.0, $x, $y, $cx, $cy, 0.0, 0.0]));
},
ag_PathSink$Recording_curveTo = ($this, $c1x, $c1y, $c2x, $c2y, $x, $y) => {
    $this.$segs.$add($rt_createDoubleArrayFromData([3.0, $x, $y, $c1x, $c1y, $c2x, $c2y]));
},
ag_PathSink$Recording_closePath = $this => {
    $this.$segs.$add($rt_createDoubleArrayFromData([4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]));
},
ag_PathSink$Recording_replay = ($this, $out) => {
    let var$2, $s;
    var$2 = $this.$segs.$iterator();
    while (var$2.$hasNext()) {
        $s = var$2.$next();
        ag_PathSink$Recording_emit($out, $s);
    }
},
ag_PathSink$Recording_emit = ($out, $s) => {
    let var$3;
    a: {
        var$3 = $s.data;
        switch (var$3[0] | 0) {
            case 0:
                $out.$moveTo(var$3[1], var$3[2]);
                break a;
            case 1:
                $out.$lineTo(var$3[1], var$3[2]);
                break a;
            case 2:
                $out.$quadTo(var$3[3], var$3[4], var$3[1], var$3[2]);
                break a;
            case 3:
                $out.$curveTo(var$3[3], var$3[4], var$3[5], var$3[6], var$3[1], var$3[2]);
                break a;
            case 4:
                break;
            default:
                break a;
        }
        $out.$closePath();
    }
},
a_Graphics = $rt_classWithoutFields(),
a_Graphics__init_ = $this => {
    jl_Object__init_($this);
};
function c_ExecutorService() {
    let a = this; jl_Object.call(a);
    a.$shutdown0 = 0;
    a.$pending = null;
}
let c_ExecutorService__init_ = $this => {
    jl_Object__init_($this);
    $this.$pending = ju_ArrayList__init_();
},
c_ExecutorService__init_0 = () => {
    let var_0 = new c_ExecutorService();
    c_ExecutorService__init_(var_0);
    return var_0;
},
c_ExecutorService_submit = ($this, $task) => {
    let var$2, $e, $$je;
    if ($this.$shutdown0)
        $rt_throw(jl_IllegalStateException__init_($rt_s(95)));
    a: {
        try {
            var$2 = c_CompletedFuture__init_1($task.$call2());
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_Exception) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return var$2;
    }
    return c_CompletedFuture__init_2(c_ExecutorService_wrap($e));
},
c_ExecutorService_execute = ($this, $task) => {
    let $id;
    if ($this.$shutdown0)
        $rt_throw(jl_IllegalStateException__init_($rt_s(95)));
    ju_Objects_requireNonNull($task);
    $id = c_EventLoop_defer$js_body$_1(otji_JS_function(otji_JSWrapper_unwrap(c_ExecutorService$execute$lambda$_3_0__init_0($task)), "run"));
    $this.$pending.$add(jl_Integer_valueOf($id));
},
c_ExecutorService_shutdown = $this => {
    $this.$shutdown0 = 1;
},
c_ExecutorService_isShutdown = $this => {
    return $this.$shutdown0;
},
c_ExecutorService_wrap = $e => {
    return $e instanceof jl_RuntimeException ? $e : jl_RuntimeException__init_3($e);
},
c_ScheduledExecutorService = $rt_classWithoutFields(c_ExecutorService),
c_ScheduledExecutorService__init_ = $this => {
    c_ExecutorService__init_($this);
},
c_ScheduledExecutorService__init_0 = () => {
    let var_0 = new c_ScheduledExecutorService();
    c_ScheduledExecutorService__init_(var_0);
    return var_0;
},
c_ScheduledExecutorService_schedule0 = ($this, $task, $delay, $unit) => {
    let $holder, var$5, var$6, var$7, $id;
    $holder = c_ScheduledExecutorService_newHolder();
    var$5 = $holder.data;
    var$6 = c_ScheduledExecutorService$schedule$lambda$_1_0__init_0($task, $holder);
    var$7 = Long_toNumber(juc_TimeUnit_toMillis($unit, $delay));
    $id = c_EventLoop_delay$js_body$_2(otji_JS_function(otji_JSWrapper_unwrap(var$6), "run"), var$7);
    var$5[0] = c_ScheduledFuture__init_0($id, 0);
    return var$5[0];
},
c_ScheduledExecutorService_schedule = ($this, $task, $delay, $unit) => {
    let $holder, var$5, var$6, var$7, $id;
    $holder = c_ScheduledExecutorService_newHolder();
    var$5 = $holder.data;
    var$6 = c_ScheduledExecutorService$schedule$lambda$_2_0__init_0($holder, $task);
    var$7 = Long_toNumber(juc_TimeUnit_toMillis($unit, $delay));
    $id = c_EventLoop_delay$js_body$_2(otji_JS_function(otji_JSWrapper_unwrap(var$6), "run"), var$7);
    var$5[0] = c_ScheduledFuture__init_0($id, 0);
    return var$5[0];
},
c_ScheduledExecutorService_scheduleAtFixedRate = ($this, $task, $initialDelay, $period, $unit) => {
    return c_ScheduledExecutorService_repeating($this, $task, $initialDelay, $period, $unit);
},
c_ScheduledExecutorService_repeating = ($this, $task, $initialDelay, $period, $unit) => {
    let $holder, $periodMs, var$7, var$8, var$9, var$10, $id;
    $holder = c_ScheduledExecutorService_newHolder();
    $periodMs = juc_TimeUnit_toMillis($unit, $period);
    if (Long_le($initialDelay, Long_ZERO)) {
        var$7 = $holder.data;
        var$8 = new c_ScheduledFuture;
        ju_Objects_requireNonNull($task);
        var$9 = c_ScheduledExecutorService$repeating$lambda$_5_1__init_0($task);
        var$10 = Long_toNumber($periodMs);
        c_ScheduledFuture__init_(var$8, c_EventLoop_repeat$js_body$_3(otji_JS_function(otji_JSWrapper_unwrap(var$9), "run"), var$10), 1);
        var$7[0] = var$8;
        return var$7[0];
    }
    var$7 = $holder.data;
    var$8 = c_ScheduledExecutorService$repeating$lambda$_5_0__init_0($task, $periodMs);
    var$10 = Long_toNumber(juc_TimeUnit_toMillis($unit, $initialDelay));
    $id = c_EventLoop_delay$js_body$_2(otji_JS_function(otji_JSWrapper_unwrap(var$8), "run"), var$10);
    var$7[0] = c_ScheduledFuture__init_0($id, 0);
    return var$7[0];
},
c_ScheduledExecutorService_newHolder = () => {
    return $rt_createArray(c_ScheduledFuture, 1);
},
c_ScheduledExecutorService_lambda$repeating$2 = ($task, $periodMs) => {
    let var$3, var$4;
    $task.$run();
    ju_Objects_requireNonNull($task);
    var$3 = c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0__init_0($task);
    var$4 = Long_toNumber($periodMs);
    c_EventLoop_repeat$js_body$_3(otji_JS_function(otji_JSWrapper_unwrap(var$3), "run"), var$4);
},
c_ScheduledExecutorService_lambda$schedule$1 = ($holder, $task) => {
    let $e, $$je;
    a: {
        try {
            $holder.data[0].$complete0($task.$call2());
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_Exception) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return;
    }
    $rt_throw(c_ExecutorService_wrap($e));
},
c_ScheduledExecutorService_lambda$schedule$0 = ($task, $holder) => {
    let var$3;
    var$3 = $holder.data;
    $task.$run();
    var$3[0].$complete0(null);
},
jl_Math = $rt_classWithoutFields(),
jl_Math_sin = var$1 => {
    return Math.sin(var$1);
},
jl_Math_cos = var$1 => {
    return Math.cos(var$1);
},
jl_Math_ceil = var$1 => {
    return Math.ceil(var$1);
},
jl_Math_round = var$1 => {
    return Long_fromNumber(var$1 + jl_Math_signum(var$1) * 0.5);
},
jl_Math_min = ($a, $b) => {
    if ($a < $b)
        $b = $a;
    return $b;
},
jl_Math_max = ($a, $b) => {
    if ($a > $b)
        $b = $a;
    return $b;
},
jl_Math_minImpl = (var$1, var$2) => {
    return Math.min(var$1, var$2);
},
jl_Math_min0 = (var$1, var$2) => {
    return jl_Math_minImpl(var$1, var$2);
},
jl_Math_sign = var$1 => {
    return Math.sign(var$1);
},
jl_Math_signum = var$1 => {
    return jl_Math_sign(var$1);
};
function jn_URI() {
    let a = this; jl_Object.call(a);
    a.$string = null;
    a.$scheme = null;
    a.$schemespecificpart = null;
    a.$authority = null;
    a.$userinfo = null;
    a.$host = null;
    a.$port = 0;
    a.$path = null;
    a.$query = null;
    a.$fragment = null;
    a.$opaque = 0;
    a.$absolute = 0;
    a.$serverAuthority = 0;
    a.$hash = 0;
}
let jn_URI__init_ = ($this, $uri) => {
    jl_Object__init_($this);
    $this.$port = (-1);
    $this.$hash = (-1);
    jn_URI$Helper_parseURI(jn_URI$Helper__init_($this), $uri, 0);
},
jn_URI__init_0 = var_0 => {
    let var_1 = new jn_URI();
    jn_URI__init_(var_1, var_0);
    return var_1;
},
jn_URI_create = $uri => {
    let $result, $e, $$je;
    a: {
        try {
            $result = jn_URI__init_0($uri);
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jn_URISyntaxException) {
                $e = $$je;
                break a;
            } else {
                throw $$e;
            }
        }
        return $result;
    }
    $rt_throw(jl_IllegalArgumentException__init_0($e.$getMessage()));
},
jn_URI_toString = $this => {
    let $result;
    if ($this.$string === null) {
        $result = jl_StringBuilder__init_();
        if ($this.$scheme !== null) {
            $result.$append11($this.$scheme);
            $result.$append0(58);
        }
        if ($this.$opaque)
            $result.$append11($this.$schemespecificpart);
        else {
            if ($this.$authority !== null) {
                $result.$append11($rt_s(49));
                $result.$append11($this.$authority);
            }
            if ($this.$path !== null)
                $result.$append11($this.$path);
            if ($this.$query !== null) {
                $result.$append0(63);
                $result.$append11($this.$query);
            }
        }
        if ($this.$fragment !== null) {
            $result.$append0(35);
            $result.$append11($this.$fragment);
        }
        $this.$string = $result.$toString();
    }
    return $this.$string;
};
function a_Component() {
    let a = this; jl_Object.call(a);
    a.$canvas = null;
    a.$ctx0 = null;
    a.$graphics = null;
    a.$mouseListeners = null;
    a.$motionListeners = null;
    a.$wheelListeners = null;
    a.$keyListeners = null;
    a.$componentListeners = null;
    a.$focusListeners = null;
    a.$width0 = 0;
    a.$height0 = 0;
    a.$dirty = 0;
    a.$pressed = 0;
}
let a_Component_rootClaimed = 0,
a_Component_$callClinit = () => {
    a_Component_$callClinit = $rt_eraseClinit(a_Component);
    a_Component__clinit_();
},
a_Component__init_ = $this => {
    let $el;
    a_Component_$callClinit();
    jl_Object__init_($this);
    $this.$mouseListeners = ju_ArrayList__init_();
    $this.$motionListeners = ju_ArrayList__init_();
    $this.$wheelListeners = ju_ArrayList__init_();
    $this.$keyListeners = ju_ArrayList__init_();
    $this.$componentListeners = ju_ArrayList__init_();
    $this.$focusListeners = ju_ArrayList__init_();
    $this.$dirty = 1;
    $this.$pressed = 0;
    if (!a_Component_rootClaimed) {
        $el = a_Component_defaultCanvas$js_body$_39();
        if ($el !== null) {
            a_Component_rootClaimed = 1;
            $this.$attach($el);
            $this.$start();
        }
    }
},
a_Component__init_0 = () => {
    let var_0 = new a_Component();
    a_Component__init_(var_0);
    return var_0;
},
a_Component_attach = ($this, $canvas) => {
    $this.$canvas = $canvas;
    $this.$ctx0 = $canvas.getContext("2d");
    $this.$graphics = a_Graphics2D__init_0($this.$ctx0);
    a_Component_applyScaling($this);
    a_Component_bindMouse($this);
    a_Component_bindKeyboard($this);
    a_Component_bindResize($this);
    $this.$repaint();
},
a_Component_applyScaling = $this => {
    let $dpr, $cssW, $cssH, var$4, var$5;
    $dpr = window.devicePixelRatio || 1;
    $cssW = a_Component_cssWidth$js_body$_31($this.$canvas);
    $cssH = a_Component_cssHeight$js_body$_32($this.$canvas);
    if ($cssW <= 0.0)
        $cssW = $this.$canvas.width;
    if ($cssH <= 0.0)
        $cssH = $this.$canvas.height;
    $this.$width0 = Long_lo((jl_Math_round($cssW)));
    $this.$height0 = Long_lo((jl_Math_round($cssH)));
    var$4 = $this.$canvas;
    var$5 = Long_lo((jl_Math_round($cssW * $dpr)));
    var$4.width = var$5;
    var$4 = $this.$canvas;
    var$5 = Long_lo((jl_Math_round($cssH * $dpr)));
    var$4.height = var$5;
    a_Component_setCssSize$js_body$_33($this.$canvas, $cssW, $cssH);
    $this.$ctx0.setTransform($dpr, 0.0, 0.0, $dpr, 0.0, 0.0);
},
a_Component_getWidth = $this => {
    return $this.$width0;
},
a_Component_getHeight = $this => {
    return $this.$height0;
},
a_Component_addMouseListener = ($this, $l) => {
    $this.$mouseListeners.$add($l);
},
a_Component_addMouseMotionListener = ($this, $l) => {
    $this.$motionListeners.$add($l);
},
a_Component_addMouseWheelListener = ($this, $l) => {
    $this.$wheelListeners.$add($l);
},
a_Component_addKeyListener = ($this, $l) => {
    $this.$keyListeners.$add($l);
},
a_Component_repaint = $this => {
    $this.$dirty = 1;
},
a_Component_start = $this => {
    a_Component_requestFrame$js_body$_37(otji_JS_function(otji_JSWrapper_unwrap(a_Component$start$lambda$_15_0__init_0($this)), "call"));
},
a_Component_frame = $this => {
    if ($this.$dirty && $this.$graphics !== null) {
        $this.$dirty = 0;
        $this.$paint1($this.$graphics);
    }
    a_Component_requestFrame$js_body$_37(otji_JS_function(otji_JSWrapper_unwrap(a_Component$frame$lambda$_16_0__init_0($this)), "call"));
},
a_Component_localX = ($this, $e) => {
    let $left, $w;
    $left = ($this.$canvas.getBoundingClientRect()).left;
    $w = ($this.$canvas.getBoundingClientRect()).width;
    if ($w <= 0.0)
        return $e.clientX;
    return Long_lo((jl_Math_round(($e.clientX - $left) / $w * $this.$width0)));
},
a_Component_localY = ($this, $e) => {
    let $top, $h;
    $top = ($this.$canvas.getBoundingClientRect()).top;
    $h = ($this.$canvas.getBoundingClientRect()).height;
    if ($h <= 0.0)
        return $e.clientY;
    return Long_lo((jl_Math_round(($e.clientY - $top) / $h * $this.$height0)));
},
a_Component_awtButton = $domButton => {
    a_Component_$callClinit();
    switch ($domButton) {
        case 0:
            break;
        case 1:
            return 2;
        case 2:
            return 3;
        default:
            return 0;
    }
    return 1;
},
a_Component_toAwt = ($this, $e, $clickCount) => {
    let var$3, var$4, var$5, var$6;
    var$3 = new ae_MouseEvent;
    var$4 = a_Component_localX($this, $e);
    var$5 = a_Component_localY($this, $e);
    var$6 = a_Component_awtButton($e.button);
    ae_MouseEvent__init_(var$3, $this, var$4, var$5, var$6, $clickCount, $e.shiftKey ? 1 : 0, $e.ctrlKey ? 1 : 0, $e.altKey ? 1 : 0, $e.metaKey ? 1 : 0);
    return var$3;
},
a_Component_bindMouse = $this => {
    let var$1, var$2, var$3;
    var$1 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_0__init_0($this);
    var$1.addEventListener("mousedown", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_1__init_0($this);
    var$3.addEventListener("mouseup", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_2__init_0($this);
    var$3.addEventListener("click", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_3__init_0($this);
    var$3.addEventListener("mouseenter", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_4__init_0($this);
    var$3.addEventListener("mouseleave", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_5__init_0($this);
    var$3.addEventListener("mousemove", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_6__init_0($this);
    var$3.addEventListener("wheel", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindMouse$lambda$_22_7__init_0();
    var$3.addEventListener("contextmenu", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
},
a_Component_bindKeyboard = $this => {
    let var$1, var$2, var$3;
    a_Component_makeFocusable$js_body$_34($this.$canvas);
    var$1 = $this.$canvas;
    var$2 = a_Component$bindKeyboard$lambda$_23_0__init_0($this);
    var$1.addEventListener("keydown", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindKeyboard$lambda$_23_1__init_0($this);
    var$3.addEventListener("keyup", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindKeyboard$lambda$_23_2__init_0($this);
    var$3.addEventListener("focus", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
    var$3 = $this.$canvas;
    var$2 = a_Component$bindKeyboard$lambda$_23_3__init_0($this);
    var$3.addEventListener("blur", otji_JS_function(otji_JSWrapper_unwrap(var$2), "handleEvent"));
},
a_Component_bindResize = $this => {
    a_Component_addWindowResize$js_body$_38(otji_JS_function(otji_JSWrapper_unwrap(a_Component$bindResize$lambda$_24_0__init_0($this)), "call"));
},
a_Component_keyCharOf = $e => {
    let $k;
    a_Component_$callClinit();
    $k = $rt_str($e.key);
    if ($k !== null && jl_String_length($k) == 1)
        return jl_String_charAt($k, 0);
    if (jl_String_equals($rt_s(96), $k))
        return 10;
    if (jl_String_equals($rt_s(97), $k))
        return 9;
    if (!jl_String_equals($rt_s(98), $k))
        return 65535;
    return 8;
},
a_Component_lambda$bindResize$12 = $this => {
    let $ce, var$2, $l;
    a_Component_applyScaling($this);
    $ce = ae_ComponentEvent__init_0($this);
    var$2 = $this.$componentListeners.$iterator();
    while (var$2.$hasNext()) {
        $l = var$2.$next();
        $l.$componentResized($ce);
    }
    $this.$repaint();
},
a_Component_lambda$bindKeyboard$11 = ($this, $e) => {
    let $fe, var$3, $l;
    $fe = ae_FocusEvent__init_0($this);
    var$3 = $this.$focusListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$focusLost($fe);
    }
},
a_Component_lambda$bindKeyboard$10 = ($this, $e) => {
    let $fe, var$3, $l;
    $fe = ae_FocusEvent__init_0($this);
    var$3 = $this.$focusListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$focusGained($fe);
    }
},
a_Component_lambda$bindKeyboard$9 = ($this, $e) => {
    let $ke, var$3, var$4, var$5, $l;
    $ke = new ae_KeyEvent;
    var$3 = a_Component_domKeyCode$js_body$_35($e);
    var$4 = a_Component_keyCharOf($e);
    ae_KeyEvent__init_($ke, $this, var$3, var$4, $e.shiftKey ? 1 : 0, $e.ctrlKey ? 1 : 0, $e.altKey ? 1 : 0, $e.metaKey ? 1 : 0);
    var$5 = $this.$keyListeners.$iterator();
    while (var$5.$hasNext()) {
        $l = var$5.$next();
        $l.$keyReleased($ke);
    }
},
a_Component_lambda$bindKeyboard$8 = ($this, $e) => {
    let $ke, var$3, var$4, var$5, $l, $c;
    $ke = new ae_KeyEvent;
    var$3 = a_Component_domKeyCode$js_body$_35($e);
    var$4 = a_Component_keyCharOf($e);
    ae_KeyEvent__init_($ke, $this, var$3, var$4, $e.shiftKey ? 1 : 0, $e.ctrlKey ? 1 : 0, $e.altKey ? 1 : 0, $e.metaKey ? 1 : 0);
    var$5 = $this.$keyListeners.$iterator();
    while (var$5.$hasNext()) {
        $l = var$5.$next();
        $l.$keyPressed($ke);
    }
    a: {
        $c = a_Component_keyCharOf($e);
        if ($c != 65535) {
            var$5 = $this.$keyListeners.$iterator();
            while (true) {
                if (!var$5.$hasNext())
                    break a;
                $l = var$5.$next();
                $l.$keyTyped($ke);
            }
        }
    }
    if ($ke.$isConsumed())
        $e.preventDefault();
},
a_Component_lambda$bindMouse$7 = $e => {
    a_Component_$callClinit();
    $e.preventDefault();
},
a_Component_lambda$bindMouse$6 = ($this, $e) => {
    let $dy, $we, var$4, var$5, var$6, var$7, var$8, $l;
    $dy = $e.deltaY;
    $we = new ae_MouseWheelEvent;
    var$4 = a_Component_localX($this, $e);
    var$5 = a_Component_localY($this, $e);
    var$6 = $dy > 0.0 ? 1 : !($dy < 0.0) ? 0 : (-1);
    var$7 = $dy / 100.0;
    ae_MouseWheelEvent__init_($we, $this, var$4, var$5, var$6, var$7, $e.shiftKey ? 1 : 0, $e.ctrlKey ? 1 : 0, $e.altKey ? 1 : 0, $e.metaKey ? 1 : 0);
    var$8 = $this.$wheelListeners.$iterator();
    while (var$8.$hasNext()) {
        $l = var$8.$next();
        $l.$mouseWheelMoved($we);
    }
},
a_Component_lambda$bindMouse$5 = ($this, $e) => {
    let $me, var$3, $l;
    a: {
        $me = a_Component_toAwt($this, $e, 0);
        if (!$this.$pressed) {
            var$3 = $this.$motionListeners.$iterator();
            while (true) {
                if (!var$3.$hasNext())
                    break a;
                $l = var$3.$next();
                $l.$mouseMoved($me);
            }
        }
        var$3 = $this.$motionListeners.$iterator();
        while (var$3.$hasNext()) {
            $l = var$3.$next();
            $l.$mouseDragged($me);
        }
    }
},
a_Component_lambda$bindMouse$4 = ($this, $e) => {
    let $me, var$3, $l;
    $me = a_Component_toAwt($this, $e, 0);
    var$3 = $this.$mouseListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$mouseExited($me);
    }
},
a_Component_lambda$bindMouse$3 = ($this, $e) => {
    let $me, var$3, $l;
    $me = a_Component_toAwt($this, $e, 0);
    var$3 = $this.$mouseListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$mouseEntered($me);
    }
},
a_Component_lambda$bindMouse$2 = ($this, $e) => {
    let $clicks, $me, var$4, $l;
    $clicks = $e.detail || 0;
    if ($clicks <= 0)
        $clicks = 1;
    $me = a_Component_toAwt($this, $e, $clicks);
    var$4 = $this.$mouseListeners.$iterator();
    while (var$4.$hasNext()) {
        $l = var$4.$next();
        $l.$mouseClicked($me);
    }
},
a_Component_lambda$bindMouse$1 = ($this, $e) => {
    let $me, var$3, $l;
    $this.$pressed = 0;
    $me = a_Component_toAwt($this, $e, 1);
    var$3 = $this.$mouseListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$mouseReleased($me);
    }
},
a_Component_lambda$bindMouse$0 = ($this, $e) => {
    let $me, var$3, $l;
    $this.$pressed = 1;
    $me = a_Component_toAwt($this, $e, 1);
    var$3 = $this.$mouseListeners.$iterator();
    while (var$3.$hasNext()) {
        $l = var$3.$next();
        $l.$mousePressed($me);
    }
},
a_Component__clinit_ = () => {
    a_Component_rootClaimed = 0;
},
a_Component_cssWidth$js_body$_31 = var$1 => {
    var r = var$1.getBoundingClientRect();
    return r.width || var$1.clientWidth;
},
a_Component_cssHeight$js_body$_32 = var$1 => {
    var r = var$1.getBoundingClientRect();
    return r.height || var$1.clientHeight;
},
a_Component_setCssSize$js_body$_33 = (var$1, var$2, var$3) => {
    var$1.style.width = var$2 + 'px';
    var$1.style.height = var$3 + 'px';
},
a_Component_makeFocusable$js_body$_34 = var$1 => {
    if (!var$1.hasAttribute('tabindex')) var$1.setAttribute('tabindex', '0');
    var$1.style.outline = 'none';
    var$1.addEventListener('mousedown', function() {
        var$1.focus();
    });
},
a_Component_domKeyCode$js_body$_35 = var$1 => {
    return var$1.keyCode || var$1.which || 0;
},
a_Component_requestFrame$js_body$_37 = var$1 => {
    requestAnimationFrame(function() {
        var$1();
    });
},
a_Component_addWindowResize$js_body$_38 = var$1 => {
    window.addEventListener('resize', function() {
        var$1();
    });
},
a_Component_defaultCanvas$js_body$_39 = () => {
    if (typeof document === 'undefined') return null;
    return globalThis.__ankCanvas || document.querySelector('canvas');
};
function d_InteractivePanel() {
    let a = this; a_Component.call(a);
    a.$card = null;
    a.$room = null;
    a.$mouseX = 0;
    a.$mouseY = 0;
    a.$status = null;
    a.$clicks = 0;
    a.$iconSize = 0;
}
let d_InteractivePanel__init_ = $this => {
    a_Component__init_($this);
    $this.$mouseX = (-1);
    $this.$mouseY = (-1);
    $this.$status = $rt_s(99);
    $this.$clicks = 0;
    $this.$iconSize = 96;
    $this.$addMouseMotionListener(d_InteractivePanel$1__init_0($this));
    $this.$addMouseListener(d_InteractivePanel$2__init_0($this));
    $this.$addMouseWheelListener(d_InteractivePanel$_init_$lambda$_0_0__init_0($this));
    $this.$addKeyListener(d_InteractivePanel$3__init_0($this));
},
d_InteractivePanel__init_0 = () => {
    let var_0 = new d_InteractivePanel();
    d_InteractivePanel__init_(var_0);
    return var_0;
},
d_InteractivePanel_ensureCard = ($this, $h) => {
    let var$2;
    if ($this.$card !== null)
        return;
    var$2 = new mr_Room;
    mr_Room$RoomType_$callClinit();
    mr_Room__init_(var$2, $rt_s(100), $rt_s(101), $rt_s(102), 17, 50, mr_Room$RoomType_PUBLIC);
    $this.$room = var$2;
    $this.$card = vr_RoomInfoCard__init_0(m_GamePanel__init_0($h), cr_RoomController__init_0($this.$room, 1));
},
d_InteractivePanel_paint = ($this, $g) => {
    let $g2d, $w, $h, $i, var$6, var$7, var$8, var$9;
    $g2d = $g;
    $w = $this.$getWidth();
    $h = $this.$getHeight();
    d_InteractivePanel_ensureCard($this, $h);
    $g2d.$setColor(a_Color__init_(13, 14, 28));
    $g2d.$fillRect(0, 0, $w, $h);
    $g2d.$setColor(a_Color__init_(30, 32, 58));
    $i = 0;
    while ($i < ($w + $h | 0)) {
        $g2d.$drawLine($i, 0, $i - $h | 0, $h);
        $i = $i + 24 | 0;
    }
    $this.$card.$draw0($g2d);
    vs_GroupIcon_draw($g2d, ($w - $this.$iconSize | 0) - 24 | 0, 20, $this.$iconSize);
    $g2d.$setFont(a_Font__init_($rt_s(22), 0, 11));
    $g2d.$setColor(a_Color__init_(160, 150, 190));
    var$6 = $this.$status;
    var$7 = $h - 10 | 0;
    $g2d.$drawString(var$6, 12, var$7);
    if ($this.$mouseX >= 0) {
        var$8 = $this.$mouseX;
        var$9 = $this.$mouseY;
        var$6 = jl_StringBuilder__init_();
        jl_StringBuilder_append0(jl_StringBuilder_append(jl_StringBuilder_append0(var$6, var$8), $rt_s(103)), var$9);
        $g2d.$drawString(jl_StringBuilder_toString(var$6), $w - 70 | 0, var$7);
    }
},
d_InteractivePanel_lambda$new$0 = ($this, $e) => {
    let var$2, var$3;
    $this.$iconSize = jl_Math_max(48, jl_Math_min(160, $this.$iconSize - ($e.$getWheelRotation() * 8 | 0) | 0));
    var$2 = $this.$iconSize;
    var$3 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append0(jl_StringBuilder_append(var$3, $rt_s(104)), var$2), $rt_s(105));
    $this.$status = jl_StringBuilder_toString(var$3);
    $this.$repaint();
};
function c_CompletableFuture$whenComplete$lambda$_8_0() {
    let a = this; jl_Object.call(a);
    a.$_05 = null;
    a.$_11 = null;
}
let c_CompletableFuture$whenComplete$lambda$_8_0__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_05 = var$1;
    var$0.$_11 = var$2;
},
c_CompletableFuture$whenComplete$lambda$_8_0__init_0 = (var_0, var_1) => {
    let var_2 = new c_CompletableFuture$whenComplete$lambda$_8_0();
    c_CompletableFuture$whenComplete$lambda$_8_0__init_(var_2, var_0, var_1);
    return var_2;
},
c_CompletableFuture$whenComplete$lambda$_8_0_accept0 = (var$0, var$1, var$2) => {
    c_CompletableFuture$whenComplete$lambda$_8_0_accept(var$0, var$1, var$2);
},
c_CompletableFuture$whenComplete$lambda$_8_0_accept = (var$0, var$1, var$2) => {
    c_CompletableFuture_lambda$whenComplete$2(var$0.$_05, var$0.$_11, var$1, var$2);
};
function ag_RoundRectangle2D$Double() {
    let a = this; ag_RoundRectangle2D.call(a);
    a.$x1 = 0.0;
    a.$y1 = 0.0;
    a.$width2 = 0.0;
    a.$height2 = 0.0;
    a.$arcwidth = 0.0;
    a.$archeight0 = 0.0;
}
let ag_RoundRectangle2D$Double__init_ = ($this, $x, $y, $w, $h, $aw, $ah) => {
    ag_RoundRectangle2D__init_($this);
    $this.$x1 = $x;
    $this.$y1 = $y;
    $this.$width2 = $w;
    $this.$height2 = $h;
    $this.$arcwidth = $aw;
    $this.$archeight0 = $ah;
},
ag_RoundRectangle2D$Double__init_0 = (var_0, var_1, var_2, var_3, var_4, var_5) => {
    let var_6 = new ag_RoundRectangle2D$Double();
    ag_RoundRectangle2D$Double__init_(var_6, var_0, var_1, var_2, var_3, var_4, var_5);
    return var_6;
},
ag_RoundRectangle2D$Double_x = $this => {
    return $this.$x1;
},
ag_RoundRectangle2D$Double_y = $this => {
    return $this.$y1;
},
ag_RoundRectangle2D$Double_w = $this => {
    return $this.$width2;
},
ag_RoundRectangle2D$Double_h = $this => {
    return $this.$height2;
},
ag_RoundRectangle2D$Double_arcW = $this => {
    return $this.$arcwidth;
},
ag_RoundRectangle2D$Double_arcH = $this => {
    return $this.$archeight0;
},
d_ConcurrencyTest = $rt_classWithoutFields(),
d_ConcurrencyTest_check = ($name, $ok) => {
    let var$3, var$4;
    var$3 = !$ok ? $rt_s(32) : $rt_s(33);
    var$4 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append(var$4, var$3), $name);
    d_ConcurrencyTest_report$js_body$_0($rt_ustr(jl_StringBuilder_toString(var$4)));
},
d_ConcurrencyTest_run = () => {
    d_ConcurrencyTest_submitRunsAndCompletes();
    d_ConcurrencyTest_executeIsDeferred();
    d_ConcurrencyTest_scheduleRespectsDelay();
    d_ConcurrencyTest_fixedRateRepeatsAndCancels();
    d_ConcurrencyTest_completableChain();
    d_ConcurrencyTest_completableFailure();
    d_ConcurrencyTest_joinOnIncompleteIsLoud();
    d_ConcurrencyTest_invokeLaterOrdering();
    d_ConcurrencyTest_deferredWorkActuallyRuns();
},
d_ConcurrencyTest_deferredWorkActuallyRuns = () => {
    let $ex, $sch, var$3, $ticks, $periodic, var$6, var$7, $seq;
    $ex = c_Executors_newSingleThreadExecutor();
    $ex.$execute(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0__init_0());
    s_SwingUtilities_invokeLater(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1__init_0());
    $sch = c_Executors_newSingleThreadScheduledExecutor();
    var$3 = d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2__init_0();
    juc_TimeUnit_$callClinit();
    $sch.$schedule(var$3, Long_fromInt(15), juc_TimeUnit_MILLISECONDS);
    $ticks = $rt_createIntArray(1);
    $ticks.data[0] = 0;
    $periodic = $rt_createArray(c_ScheduledFuture, 1);
    var$6 = $periodic.data;
    var$6[0] = $sch.$scheduleAtFixedRate(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3__init_0($ticks, $periodic), Long_ZERO, Long_fromInt(10), juc_TimeUnit_MILLISECONDS);
    var$7 = c_CompletableFuture_supplyAsync(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4__init_0());
    var$3 = d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5__init_0();
    var$7 = var$7.$thenApply(var$3);
    var$3 = d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6__init_0();
    var$7.$thenAccept(var$3);
    var$7 = c_CompletableFuture_supplyAsync(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7__init_0());
    var$3 = d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8__init_0();
    var$7 = var$7.$exceptionally(var$3);
    var$3 = d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9__init_0();
    var$7.$thenAccept(var$3);
    $seq = ju_ArrayList__init_();
    s_SwingUtilities_invokeLater(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10__init_0($seq));
    s_SwingUtilities_invokeLater(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11__init_0($seq));
    s_SwingUtilities_invokeLater(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12__init_0($seq));
},
d_ConcurrencyTest_submitRunsAndCompletes = () => {
    let $ex, $f;
    $ex = c_Executors_newSingleThreadExecutor();
    $f = $ex.$submit(d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0__init_0());
    d_ConcurrencyTest_check($rt_s(106), $f.$isDone() && ($f.$get()).$intValue() == 42 ? 1 : 0);
    $ex.$shutdown();
    d_ConcurrencyTest_check($rt_s(107), $ex.$isShutdown());
},
d_ConcurrencyTest_executeIsDeferred = () => {
    let $ex, $order;
    $ex = c_Executors_newSingleThreadExecutor();
    $order = ju_ArrayList__init_();
    $ex.$execute(d_ConcurrencyTest$executeIsDeferred$lambda$_6_0__init_0($order));
    $order.$add($rt_s(108));
    d_ConcurrencyTest_check($rt_s(109), $order.$size() == 1 && jl_String_equals($order.$get1(0), $rt_s(108)) ? 1 : 0);
},
d_ConcurrencyTest_scheduleRespectsDelay = () => {
    let $ex, $ran, var$3, var$4, $f;
    $ex = c_Executors_newSingleThreadScheduledExecutor();
    $ran = $rt_createBooleanArray(1);
    var$3 = $ran.data;
    var$3[0] = 0;
    var$4 = d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0__init_0($ran);
    juc_TimeUnit_$callClinit();
    $f = $ex.$schedule0(var$4, Long_fromInt(20), juc_TimeUnit_MILLISECONDS);
    d_ConcurrencyTest_check($rt_s(110), var$3[0] ? 0 : 1);
    d_ConcurrencyTest_check($rt_s(111), !$f.$isDone() && !$f.$isCancelled() ? 1 : 0);
    $f.$cancel(0);
    d_ConcurrencyTest_check($rt_s(112), $f.$isCancelled());
},
d_ConcurrencyTest_fixedRateRepeatsAndCancels = () => {
    let $ex, var$2, $f, $cancelled;
    $ex = c_Executors_newSingleThreadScheduledExecutor();
    var$2 = d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0__init_0();
    juc_TimeUnit_$callClinit();
    $f = $ex.$scheduleAtFixedRate(var$2, Long_ZERO, Long_fromInt(10), juc_TimeUnit_MILLISECONDS);
    $cancelled = $f.$cancel(0);
    d_ConcurrencyTest_check($rt_s(113), $cancelled && $f.$isCancelled() ? 1 : 0);
},
d_ConcurrencyTest_completableChain = () => {
    let $f, $seen, var$3, var$4, var$5, $outcome;
    $f = c_CompletableFuture_completedFuture(jl_Integer_valueOf(10));
    $seen = $rt_createIntArray(1);
    var$3 = $seen.data;
    var$3[0] = 0;
    var$4 = $f.$thenApply(d_ConcurrencyTest$completableChain$lambda$_9_0__init_0());
    var$5 = d_ConcurrencyTest$completableChain$lambda$_9_1__init_0($seen);
    var$4.$thenAccept(var$5);
    d_ConcurrencyTest_check($rt_s(114), var$3[0] != 30 ? 0 : 1);
    $outcome = $rt_createArray(jl_String, 1);
    var$3 = $outcome.data;
    var$3[0] = null;
    (c_CompletableFuture_completedFuture($rt_s(115))).$whenComplete(d_ConcurrencyTest$completableChain$lambda$_9_2__init_0($outcome));
    d_ConcurrencyTest_check($rt_s(116), jl_String_equals($rt_s(117), var$3[0]));
},
d_ConcurrencyTest_completableFailure = () => {
    let $f, $recovered, var$3, $sawError;
    $f = c_CompletableFuture__init_();
    $f.$completeExceptionally(jl_IllegalStateException__init_($rt_s(118)));
    d_ConcurrencyTest_check($rt_s(119), $f.$isCompletedExceptionally());
    $recovered = $rt_createArray(jl_String, 1);
    var$3 = $recovered.data;
    var$3[0] = null;
    ($f.$exceptionally(d_ConcurrencyTest$completableFailure$lambda$_10_0__init_0())).$thenAccept(d_ConcurrencyTest$completableFailure$lambda$_10_1__init_0($recovered));
    d_ConcurrencyTest_check($rt_s(120), jl_String_equals($rt_s(121), var$3[0]));
    $sawError = $rt_createBooleanArray(1);
    var$3 = $sawError.data;
    var$3[0] = 0;
    $f.$whenComplete(d_ConcurrencyTest$completableFailure$lambda$_10_2__init_0($sawError));
    d_ConcurrencyTest_check($rt_s(122), var$3[0]);
},
d_ConcurrencyTest_joinOnIncompleteIsLoud = () => {
    let $f, $threw, $$je;
    $f = c_CompletableFuture__init_();
    $threw = 0;
    a: {
        try {
            $f.$join();
            break a;
        } catch ($$e) {
            $$je = $rt_wrapException($$e);
            if ($$je instanceof jl_IllegalStateException) {
                $threw = 1;
                break a;
            } else {
                throw $$e;
            }
        }
    }
    d_ConcurrencyTest_check($rt_s(123), $threw);
},
d_ConcurrencyTest_invokeLaterOrdering = () => {
    let $order;
    $order = ju_ArrayList__init_();
    s_SwingUtilities_invokeLater(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0__init_0($order));
    $order.$add($rt_s(124));
    d_ConcurrencyTest_check($rt_s(125), $order.$size() != 1 ? 0 : 1);
    d_ConcurrencyTest_check($rt_s(126), s_SwingUtilities_isEventDispatchThread());
    s_SwingUtilities_invokeAndWait(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1__init_0($order));
    d_ConcurrencyTest_check($rt_s(127), $order.$contains1($rt_s(128)));
},
d_ConcurrencyTest_lambda$invokeLaterOrdering$24 = $order => {
    $order.$add($rt_s(128));
},
d_ConcurrencyTest_lambda$invokeLaterOrdering$23 = $order => {
    $order.$add($rt_s(129));
},
d_ConcurrencyTest_lambda$completableFailure$22 = ($sawError, $v, $t) => {
    let var$4;
    var$4 = $t === null ? 0 : 1;
    $sawError.data[0] = var$4;
},
d_ConcurrencyTest_lambda$completableFailure$21 = ($recovered, $v) => {
    $recovered.data[0] = $v;
},
d_ConcurrencyTest_lambda$completableFailure$20 = $t => {
    return $rt_s(121);
},
d_ConcurrencyTest_lambda$completableChain$19 = ($outcome, $v, $t) => {
    let var$4, var$5, var$6;
    var$4 = $t !== null ? 0 : 1;
    var$5 = $outcome.data;
    var$6 = jl_StringBuilder__init_();
    jl_StringBuilder_append2(jl_StringBuilder_append1(jl_StringBuilder_append(var$6, $v), 58), var$4);
    var$5[0] = jl_StringBuilder_toString(var$6);
},
d_ConcurrencyTest_lambda$completableChain$18 = ($seen, $v) => {
    $seen.data[0] = $v.$intValue();
},
d_ConcurrencyTest_lambda$completableChain$17 = $v => {
    return jl_Integer_valueOf($v.$intValue() * 3 | 0);
},
d_ConcurrencyTest_lambda$fixedRateRepeatsAndCancels$16 = () => {
    return;
},
d_ConcurrencyTest_lambda$scheduleRespectsDelay$15 = $ran => {
    $ran.data[0] = 1;
    return jl_Boolean_valueOf(1);
},
d_ConcurrencyTest_lambda$executeIsDeferred$14 = $order => {
    $order.$add($rt_s(130));
},
d_ConcurrencyTest_lambda$submitRunsAndCompletes$13 = () => {
    return jl_Integer_valueOf(42);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$12 = $seq => {
    let var$2;
    $seq.$add(jl_Integer_valueOf(3));
    var$2 = $seq.$size() == 3 && ($seq.$get1(0)).$intValue() == 1 && ($seq.$get1(1)).$intValue() == 2 && ($seq.$get1(2)).$intValue() == 3 ? 1 : 0;
    d_ConcurrencyTest_check($rt_s(131), var$2);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$11 = $seq => {
    $seq.$add(jl_Integer_valueOf(2));
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$10 = $seq => {
    $seq.$add(jl_Integer_valueOf(1));
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$9 = $v => {
    d_ConcurrencyTest_check($rt_s(132), jl_String_equals($rt_s(133), $v));
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$8 = $t => {
    return $rt_s(133);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$7 = () => {
    $rt_throw(jl_IllegalStateException__init_($rt_s(134)));
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$6 = $v => {
    d_ConcurrencyTest_check($rt_s(135), $v.$intValue() != 42 ? 0 : 1);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$5 = $v => {
    return jl_Integer_valueOf($v.$intValue() * 2 | 0);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$4 = () => {
    return jl_Integer_valueOf(21);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$3 = ($ticks, $periodic) => {
    let var$3;
    var$3 = $ticks.data;
    var$3[0] = var$3[0] + 1 | 0;
    if (var$3[0] == 3) {
        $periodic.data[0].$cancel(0);
        d_ConcurrencyTest_check($rt_s(136), 1);
    }
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$2 = () => {
    d_ConcurrencyTest_check($rt_s(137), 1);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$1 = () => {
    d_ConcurrencyTest_check($rt_s(138), 1);
},
d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$0 = () => {
    d_ConcurrencyTest_check($rt_s(139), 1);
},
d_ConcurrencyTest_report$js_body$_0 = var$1 => {
    if (globalThis.__ankTest) globalThis.__ankTest(var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$2();
};
function d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3() {
    let a = this; jl_Object.call(a);
    a.$_01 = null;
    a.$_1 = null;
}
let d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3__init_ = (var$0, var$1, var$2) => {
    jl_Object__init_(var$0);
    var$0.$_01 = var$1;
    var$0.$_1 = var$2;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3__init_0 = (var_0, var_1) => {
    let var_2 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3__init_(var_2, var_0, var_1);
    return var_2;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$3(var$0.$_01, var$0.$_1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$0();
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1_run = var$0 => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$1();
},
d_Main = $rt_classWithoutFields(),
d_Main_$callClinit = () => {
    d_Main_$callClinit = $rt_eraseClinit(d_Main);
    d_Main__clinit_();
},
d_Main_main = $args => {
    d_Main_$callClinit();
    d_InteractivePanel__init_(new d_InteractivePanel);
    d_ConcurrencyTest_run();
    d_WebSocketTest_run();
    d_ImageTest_run();
    d_Main_log$js_body$_1("java.awt.Component live on <canvas> — no AnkillousJ types in the source");
},
d_Main_log$js_body$_1 = var$1 => {
    if (globalThis.__ankLog) globalThis.__ankLog(var$1);
},
d_Main__clinit_ = () => {
    return;
};
function m_GamePanel() {
    jl_Object.call(this);
    this.$screenHeight = 0;
}
let m_GamePanel__init_ = ($this, $screenHeight) => {
    jl_Object__init_($this);
    $this.$screenHeight = $screenHeight;
},
m_GamePanel__init_0 = var_0 => {
    let var_1 = new m_GamePanel();
    m_GamePanel__init_(var_1, var_0);
    return var_1;
},
m_GamePanel_getHeight = $this => {
    return $this.$screenHeight;
};
function n_BrowserWebSocket$BuilderImpl() {
    jl_Object.call(this);
    this.$headers = null;
}
let n_BrowserWebSocket$BuilderImpl__init_ = $this => {
    jl_Object__init_($this);
    $this.$headers = ju_ArrayList__init_();
},
n_BrowserWebSocket$BuilderImpl__init_0 = () => {
    let var_0 = new n_BrowserWebSocket$BuilderImpl();
    n_BrowserWebSocket$BuilderImpl__init_(var_0);
    return var_0;
},
n_BrowserWebSocket$BuilderImpl_header = ($this, $name, $value) => {
    $this.$headers.$add($rt_wrapArray(jl_String, [$name, $value]));
    return $this;
},
n_BrowserWebSocket$BuilderImpl_connectTimeout = ($this, $timeout) => {
    return $this;
},
n_BrowserWebSocket$BuilderImpl_buildAsync = ($this, $uri, $listener) => {
    let $ready;
    $ready = c_CompletableFuture__init_();
    n_BrowserWebSocket__init_(new n_BrowserWebSocket, n_BrowserWebSocket$BuilderImpl_withHeadersAsQuery($this, jn_URI_toString($uri)), $listener, $ready);
    return $ready;
},
n_BrowserWebSocket$BuilderImpl_withHeadersAsQuery = ($this, $url) => {
    let $sb, $i;
    if ($this.$headers.$isEmpty())
        return $url;
    $sb = jl_StringBuilder__init_2($url);
    $sb.$append0(jl_String_indexOf($url, 63) < 0 ? 63 : 38);
    $i = 0;
    while ($i < $this.$headers.$size()) {
        if ($i > 0)
            $sb.$append0(38);
        (($sb.$append11(n_BrowserWebSocket$BuilderImpl_encode(($this.$headers.$get1($i)).data[0]))).$append0(61)).$append11(n_BrowserWebSocket$BuilderImpl_encode(($this.$headers.$get1($i)).data[1]));
        $i = $i + 1 | 0;
    }
    return $sb.$toString();
},
n_BrowserWebSocket$BuilderImpl_encode = $s => {
    let $sb, $i, $c, $safe, $hex;
    $sb = jl_StringBuilder__init_();
    $i = 0;
    while ($i < jl_String_length($s)) {
        $c = jl_String_charAt($s, $i);
        $safe = !($c >= 97 && $c <= 122) && !($c >= 65 && $c <= 90) && !($c >= 48 && $c <= 57) && $c != 45 && $c != 95 && $c != 46 && $c != 126 ? 0 : 1;
        if ($safe)
            $sb.$append0($c);
        else {
            $sb.$append0(37);
            $hex = jl_String_toUpperCase(jl_Integer_toHexString($c & 255));
            if (jl_String_length($hex) < 2)
                $sb.$append0(48);
            $sb.$append11($hex);
        }
        $i = $i + 1 | 0;
    }
    return $sb.$toString();
};
function ju_HashMap() {
    let a = this; ju_AbstractMap.call(a);
    a.$elementCount = 0;
    a.$elementData = null;
    a.$modCount0 = 0;
    a.$loadFactor = 0.0;
    a.$threshold = 0;
}
let ju_HashMap_newElementArray = ($this, $s) => {
    return $rt_createArray(ju_HashMap$HashEntry, $s);
},
ju_HashMap__init_1 = $this => {
    ju_HashMap__init_($this, 16);
},
ju_HashMap__init_2 = () => {
    let var_0 = new ju_HashMap();
    ju_HashMap__init_1(var_0);
    return var_0;
},
ju_HashMap__init_ = ($this, $capacity) => {
    ju_HashMap__init_0($this, $capacity, 0.75);
},
ju_HashMap__init_3 = var_0 => {
    let var_1 = new ju_HashMap();
    ju_HashMap__init_(var_1, var_0);
    return var_1;
},
ju_HashMap_calculateCapacity = $x => {
    let var$2, var$3;
    if ($x >= 1073741824)
        return 1073741824;
    if (!$x)
        return 16;
    var$2 = $x - 1 | 0;
    var$3 = var$2 | var$2 >> 1;
    var$3 = var$3 | var$3 >> 2;
    var$3 = var$3 | var$3 >> 4;
    var$3 = var$3 | var$3 >> 8;
    var$3 = var$3 | var$3 >> 16;
    return var$3 + 1 | 0;
},
ju_HashMap__init_0 = ($this, $capacity, $loadFactor) => {
    let var$3;
    ju_AbstractMap__init_($this);
    if ($capacity >= 0 && $loadFactor > 0.0) {
        var$3 = ju_HashMap_calculateCapacity($capacity);
        $this.$elementCount = 0;
        $this.$elementData = $this.$newElementArray(var$3);
        $this.$loadFactor = $loadFactor;
        ju_HashMap_computeThreshold($this);
        return;
    }
    $rt_throw(jl_IllegalArgumentException__init_());
},
ju_HashMap__init_4 = (var_0, var_1) => {
    let var_2 = new ju_HashMap();
    ju_HashMap__init_0(var_2, var_0, var_1);
    return var_2;
},
ju_HashMap_clear = $this => {
    if ($this.$elementCount > 0) {
        $this.$elementCount = 0;
        ju_Arrays_fill1($this.$elementData, null);
        $this.$modCount0 = $this.$modCount0 + 1 | 0;
    }
},
ju_HashMap_computeThreshold = $this => {
    $this.$threshold = $this.$elementData.data.length * $this.$loadFactor | 0;
},
ju_HashMap_get = ($this, $key) => {
    let $m;
    $m = ju_HashMap_entryByKey($this, $key);
    if ($m === null)
        return null;
    return $m.$value;
},
ju_HashMap_entryByKey = ($this, $key) => {
    let $m, $hash, $index;
    if ($key === null)
        $m = ju_HashMap_findNullKeyEntry($this);
    else {
        $hash = $key.$hashCode();
        $index = $hash & ($this.$elementData.data.length - 1 | 0);
        $m = ju_HashMap_findNonNullKeyEntry($this, $key, $index, $hash);
    }
    return $m;
},
ju_HashMap_findNonNullKeyEntry = ($this, $key, $index, $keyHash) => {
    let $m;
    $m = $this.$elementData.data[$index];
    while ($m !== null && !($m.$origKeyHash == $keyHash && ju_HashMap_areEqualKeys($key, $m.$key))) {
        $m = $m.$next0;
    }
    return $m;
},
ju_HashMap_findNullKeyEntry = $this => {
    let $m;
    $m = $this.$elementData.data[0];
    while ($m !== null && $m.$key !== null) {
        $m = $m.$next0;
    }
    return $m;
},
ju_HashMap_put = ($this, $key, $value) => {
    return ju_HashMap_putImpl($this, $key, $value);
},
ju_HashMap_putImpl = ($this, $key, $value) => {
    let $entry, var$4, $hash, $index, $result;
    if ($key === null) {
        $entry = ju_HashMap_findNullKeyEntry($this);
        if ($entry === null) {
            $this.$modCount0 = $this.$modCount0 + 1 | 0;
            $entry = ju_HashMap_createHashedEntry($this, null, 0, 0);
            var$4 = $this.$elementCount + 1 | 0;
            $this.$elementCount = var$4;
            if (var$4 > $this.$threshold)
                $this.$rehash();
        }
    } else {
        $hash = $key.$hashCode();
        $index = $hash & ($this.$elementData.data.length - 1 | 0);
        $entry = ju_HashMap_findNonNullKeyEntry($this, $key, $index, $hash);
        if ($entry === null) {
            $this.$modCount0 = $this.$modCount0 + 1 | 0;
            $entry = ju_HashMap_createHashedEntry($this, $key, $index, $hash);
            var$4 = $this.$elementCount + 1 | 0;
            $this.$elementCount = var$4;
            if (var$4 > $this.$threshold)
                $this.$rehash();
        }
    }
    $result = $entry.$value;
    $entry.$value = $value;
    return $result;
},
ju_HashMap_createHashedEntry = ($this, $key, $index, $hash) => {
    let $entry;
    $entry = ju_HashMap$HashEntry__init_0($key, $hash);
    $entry.$next0 = $this.$elementData.data[$index];
    $this.$elementData.data[$index] = $entry;
    return $entry;
},
ju_HashMap_rehash0 = ($this, $capacity) => {
    let $length, $newData, $i, $entry, var$6, $index, $next;
    $length = ju_HashMap_calculateCapacity(!$capacity ? 1 : $capacity << 1);
    $newData = $this.$newElementArray($length);
    $i = 0;
    while ($i < $this.$elementData.data.length) {
        $entry = $this.$elementData.data[$i];
        $this.$elementData.data[$i] = null;
        while ($entry !== null) {
            var$6 = $newData.data;
            $index = $entry.$origKeyHash & ($length - 1 | 0);
            $next = $entry.$next0;
            $entry.$next0 = var$6[$index];
            var$6[$index] = $entry;
            $entry = $next;
        }
        $i = $i + 1 | 0;
    }
    $this.$elementData = $newData;
    ju_HashMap_computeThreshold($this);
},
ju_HashMap_rehash = $this => {
    $this.$rehash0($this.$elementData.data.length);
},
ju_HashMap_areEqualKeys = ($key1, $key2) => {
    return $key1 !== $key2 && !$key1.$equals($key2) ? 0 : 1;
};
function otciu_UnicodeHelper$Range() {
    let a = this; jl_Object.call(a);
    a.$start0 = 0;
    a.$end = 0;
    a.$data = null;
}
let otciu_UnicodeHelper$Range__init_ = ($this, $start, $end, $data) => {
    jl_Object__init_($this);
    $this.$start0 = $start;
    $this.$end = $end;
    $this.$data = $data;
},
otciu_UnicodeHelper$Range__init_0 = (var_0, var_1, var_2) => {
    let var_3 = new otciu_UnicodeHelper$Range();
    otciu_UnicodeHelper$Range__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
otcit_DoubleAnalyzer = $rt_classWithoutFields(),
otcit_DoubleAnalyzer_MAX_MANTISSA = Long_ZERO,
otcit_DoubleAnalyzer_resultForLog10 = null,
otcit_DoubleAnalyzer_mantissa10Table = null,
otcit_DoubleAnalyzer_exp10Table = null,
otcit_DoubleAnalyzer_$callClinit = () => {
    otcit_DoubleAnalyzer_$callClinit = $rt_eraseClinit(otcit_DoubleAnalyzer);
    otcit_DoubleAnalyzer__clinit_();
},
otcit_DoubleAnalyzer_analyze = ($d, $result) => {
    let $bits, $mantissa, $exponent, var$6, $decExponent, var$8, var$9, $binExponentCorrection, $mantissaShift, $decMantissa, var$13, var$14, var$15, $decMantissaHi, $decMantissaLow, $lowerPos, $upperPos, $posCmp;
    otcit_DoubleAnalyzer_$callClinit();
    $bits = jl_Double_doubleToLongBits($d);
    $result.$sign0 = Long_eq(Long_and($bits, Long_create(0, 2147483648)), Long_ZERO) ? 0 : 1;
    $mantissa = Long_and($bits, Long_create(4294967295, 1048575));
    $exponent = Long_lo(Long_shr($bits, 52)) & 2047;
    if (Long_eq($mantissa, Long_ZERO) && !$exponent) {
        $result.$mantissa = Long_ZERO;
        $result.$exponent = 0;
        return;
    }
    if ($exponent)
        var$6 = Long_or($mantissa, Long_create(0, 1048576));
    else {
        var$6 = Long_shl($mantissa, 1);
        while (Long_eq(Long_and(var$6, Long_create(0, 1048576)), Long_ZERO)) {
            var$6 = Long_shl(var$6, 1);
            $exponent = $exponent + (-1) | 0;
        }
    }
    $decExponent = ju_Arrays_binarySearch(otcit_DoubleAnalyzer_exp10Table, $exponent << 16 >> 16);
    if ($decExponent < 0)
        $decExponent =  -$decExponent | 0;
    var$8 = otcit_DoubleAnalyzer_exp10Table.data;
    var$9 = $decExponent + 1 | 0;
    $binExponentCorrection = $exponent - var$8[var$9] | 0;
    $mantissaShift = 12 + $binExponentCorrection | 0;
    $decMantissa = otcit_DoubleAnalyzer_mulAndShiftRight(var$6, otcit_DoubleAnalyzer_mantissa10Table.data[var$9], $mantissaShift);
    if (Long_le($decMantissa, otcit_DoubleAnalyzer_MAX_MANTISSA)) {
        while (jl_Long_compareUnsigned($decMantissa, otcit_DoubleAnalyzer_MAX_MANTISSA) <= 0) {
            $decExponent = $decExponent + (-1) | 0;
            $decMantissa = Long_add(Long_mul($decMantissa, Long_fromInt(10)), Long_fromInt(9));
        }
        var$8 = otcit_DoubleAnalyzer_exp10Table.data;
        var$9 = $decExponent + 1 | 0;
        var$13 = $exponent - var$8[var$9] | 0;
        $mantissaShift = 12 + var$13 | 0;
        $decMantissa = otcit_DoubleAnalyzer_mulAndShiftRight(var$6, otcit_DoubleAnalyzer_mantissa10Table.data[var$9], $mantissaShift);
    }
    var$14 = Long_shl(var$6, 1);
    var$6 = Long_add(var$14, Long_fromInt(1));
    var$8 = otcit_DoubleAnalyzer_mantissa10Table.data;
    var$13 = $decExponent + 1 | 0;
    var$15 = var$8[var$13];
    var$9 = $mantissaShift - 1 | 0;
    $decMantissaHi = otcit_DoubleAnalyzer_mulAndShiftRight(var$6, var$15, var$9);
    $decMantissaLow = otcit_DoubleAnalyzer_mulAndShiftRight(Long_sub(var$14, Long_fromInt(1)), otcit_DoubleAnalyzer_mantissa10Table.data[var$13], var$9);
    $lowerPos = otcit_DoubleAnalyzer_findLowerDistance($decMantissa, $decMantissaLow);
    $upperPos = otcit_DoubleAnalyzer_findUpperDistance($decMantissa, $decMantissaHi);
    $posCmp = jl_Long_compareUnsigned($lowerPos, $upperPos);
    var$6 = $posCmp > 0 ? Long_mul(jl_Long_divideUnsigned($decMantissa, $lowerPos), $lowerPos) : $posCmp < 0 ? Long_add(Long_mul(jl_Long_divideUnsigned($decMantissa, $upperPos), $upperPos), $upperPos) : Long_mul(jl_Long_divideUnsigned(Long_add($decMantissa, Long_div($upperPos, Long_fromInt(2))), $upperPos), $upperPos);
    if (jl_Long_compareUnsigned(var$6, Long_create(2808348672, 232830643)) >= 0)
        while (true) {
            $decExponent = $decExponent + 1 | 0;
            var$6 = jl_Long_divideUnsigned(var$6, Long_fromInt(10));
            if (jl_Long_compareUnsigned(var$6, Long_create(2808348672, 232830643)) < 0)
                break;
        }
    else if (jl_Long_compareUnsigned(var$6, Long_create(1569325056, 23283064)) < 0) {
        $decExponent = $decExponent + (-1) | 0;
        var$6 = Long_mul(var$6, Long_fromInt(10));
    }
    $result.$mantissa = var$6;
    $result.$exponent = $decExponent - 330 | 0;
},
otcit_DoubleAnalyzer_findLowerDistance = ($mantissa, $lower) => {
    let $pos, $pos_0, var$5, var$6;
    otcit_DoubleAnalyzer_$callClinit();
    $pos = Long_fromInt(1);
    while (true) {
        $pos_0 = Long_mul($pos, Long_fromInt(10));
        var$5 = jl_Long_divideUnsigned($mantissa, $pos_0);
        var$6 = jl_Long_divideUnsigned($lower, $pos_0);
        if (jl_Long_compareUnsigned(var$5, var$6) <= 0)
            break;
        $pos = $pos_0;
    }
    return $pos;
},
otcit_DoubleAnalyzer_findUpperDistance = ($mantissa, $upper) => {
    let $pos, $pos_0, var$5, var$6;
    otcit_DoubleAnalyzer_$callClinit();
    $pos = Long_fromInt(1);
    while (true) {
        $pos_0 = Long_mul($pos, Long_fromInt(10));
        var$5 = jl_Long_divideUnsigned($mantissa, $pos_0);
        var$6 = jl_Long_divideUnsigned($upper, $pos_0);
        if (jl_Long_compareUnsigned(var$5, var$6) >= 0)
            break;
        $pos = $pos_0;
    }
    return $pos;
},
otcit_DoubleAnalyzer_mulAndShiftRight = ($a, $b, $shift) => {
    let $a1, $a2, $a3, $a4, $b1, $b2, $b3, $b4, $cm, $c0, $c1, $c2, $c3, $c, var$18;
    otcit_DoubleAnalyzer_$callClinit();
    $a1 = Long_and($a, Long_fromInt(65535));
    $a2 = Long_and(Long_shru($a, 16), Long_fromInt(65535));
    $a3 = Long_and(Long_shru($a, 32), Long_fromInt(65535));
    $a4 = Long_and(Long_shru($a, 48), Long_fromInt(65535));
    $b1 = Long_and($b, Long_fromInt(65535));
    $b2 = Long_and(Long_shru($b, 16), Long_fromInt(65535));
    $b3 = Long_and(Long_shru($b, 32), Long_fromInt(65535));
    $b4 = Long_and(Long_shru($b, 48), Long_fromInt(65535));
    $cm = Long_add(Long_add(Long_mul($b3, $a1), Long_mul($b2, $a2)), Long_mul($b1, $a3));
    $c0 = Long_add(Long_add(Long_add(Long_mul($b4, $a1), Long_mul($b3, $a2)), Long_mul($b2, $a3)), Long_mul($b1, $a4));
    $c1 = Long_add(Long_add(Long_mul($b4, $a2), Long_mul($b3, $a3)), Long_mul($b2, $a4));
    $c2 = Long_add(Long_mul($b4, $a3), Long_mul($b3, $a4));
    $c3 = Long_mul($b4, $a4);
    $c = Long_add(Long_add(Long_shl($c3, 32 + $shift | 0), Long_shl($c2, 16 + $shift | 0)), Long_shl($c1, $shift));
    var$18 = Long_add($cm, Long_shl($c0, 16));
    var$18 = Long_add($c, Long_shru(var$18, 32 - $shift | 0));
    return var$18;
},
otcit_DoubleAnalyzer__clinit_ = () => {
    otcit_DoubleAnalyzer_MAX_MANTISSA = jl_Long_divideUnsigned(Long_fromInt(-1), Long_fromInt(10));
    otcit_DoubleAnalyzer_resultForLog10 = otcit_DoubleAnalyzer$Result__init_();
    otcit_DoubleAnalyzer_mantissa10Table = $rt_createLongArrayFromData([Long_create(3251292512, 2194092222), Long_create(1766094183, 3510547556), Long_create(553881887, 2808438045), Long_create(443105509, 2246750436), Long_create(3285949193, 3594800697), Long_create(910772436, 2875840558), Long_create(2446604867, 2300672446), Long_create(2196580869, 3681075914), Long_create(2616258154, 2944860731), Long_create(1234013064, 2355888585), Long_create(1974420903, 3769421736), Long_create(720543263, 3015537389), Long_create(1435428070, 2412429911),
    Long_create(578697993, 3859887858), Long_create(2180945313, 3087910286), Long_create(885762791, 2470328229), Long_create(3135207384, 3952525166), Long_create(1649172448, 3162020133), Long_create(3037324877, 2529616106), Long_create(3141732885, 4047385770), Long_create(2513386308, 3237908616), Long_create(1151715587, 2590326893), Long_create(983751480, 4144523029), Long_create(1645994643, 3315618423), Long_create(3034782633, 2652494738), Long_create(3996658754, 4243991581), Long_create(2338333544, 3395193265),
    Long_create(1870666835, 2716154612), Long_create(4073513845, 2172923689), Long_create(3940641775, 3476677903), Long_create(575533043, 2781342323), Long_create(2178413352, 2225073858), Long_create(2626467905, 3560118173), Long_create(3819161242, 2848094538), Long_create(478348616, 2278475631), Long_create(3342338164, 3645561009), Long_create(3532863990, 2916448807), Long_create(1108304273, 2333159046), Long_create(55299919, 3733054474), Long_create(903233395, 2986443579), Long_create(1581580175, 2389154863),
    Long_create(1671534821, 3822647781), Long_create(478234397, 3058118225), Long_create(382587518, 2446494580), Long_create(612140029, 3914391328), Long_create(2207698941, 3131513062), Long_create(48172235, 2505210450), Long_create(77075576, 4008336720), Long_create(61660460, 3206669376), Long_create(3485302205, 2565335500), Long_create(1281516232, 4104536801), Long_create(166219527, 3283629441), Long_create(3568949458, 2626903552), Long_create(2274345296, 4203045684), Long_create(2678469696, 3362436547), Long_create(424788838, 2689949238),
    Long_create(2057817989, 2151959390), Long_create(3292508783, 3443135024), Long_create(3493000485, 2754508019), Long_create(3653393847, 2203606415), Long_create(1550462860, 3525770265), Long_create(1240370288, 2820616212), Long_create(3569276608, 2256492969), Long_create(3133862195, 3610388751), Long_create(1648096297, 2888311001), Long_create(459483578, 2310648801), Long_create(3312154103, 3697038081), Long_create(1790729823, 2957630465), Long_create(1432583858, 2366104372), Long_create(3151127633, 3785766995),
    Long_create(2520902106, 3028613596), Long_create(1157728226, 2422890877), Long_create(2711358621, 3876625403), Long_create(3887073815, 3101300322), Long_create(1391672133, 2481040258), Long_create(1367681954, 3969664413), Long_create(2812132482, 3175731530), Long_create(2249705985, 2540585224), Long_create(1022549199, 4064936359), Long_create(1677032818, 3251949087), Long_create(3918606632, 2601559269), Long_create(3692790234, 4162494831), Long_create(2095238728, 3329995865), Long_create(1676190982, 2663996692),
    Long_create(3540899031, 4262394707), Long_create(1114732307, 3409915766), Long_create(32792386, 2727932613), Long_create(1744220827, 2182346090), Long_create(2790753324, 3491753744), Long_create(3091596118, 2793402995), Long_create(2473276894, 2234722396), Long_create(2239256113, 3575555834), Long_create(2650398349, 2860444667), Long_create(402331761, 2288355734), Long_create(2361717736, 3661369174), Long_create(2748367648, 2929095339), Long_create(3057687578, 2343276271), Long_create(3174313206, 3749242034),
    Long_create(3398444024, 2999393627), Long_create(1000768301, 2399514902), Long_create(2460222741, 3839223843), Long_create(3686165111, 3071379074), Long_create(3807925548, 2457103259), Long_create(3515700499, 3931365215), Long_create(2812560399, 3145092172), Long_create(532061401, 2516073738), Long_create(4287272078, 4025717980), Long_create(3429817663, 3220574384), Long_create(3602847589, 2576459507), Long_create(2328582306, 4122335212), Long_create(144878926, 3297868170), Long_create(115903141, 2638294536),
    Long_create(2762425404, 4221271257), Long_create(491953404, 3377017006), Long_create(3829536560, 2701613604), Long_create(3922622707, 2161290883), Long_create(1122235577, 3458065414), Long_create(1756781920, 2766452331), Long_create(546432077, 2213161865), Long_create(874291324, 3541058984), Long_create(1558426518, 2832847187), Long_create(3823721592, 2266277749), Long_create(3540974170, 3626044399), Long_create(3691772795, 2900835519), Long_create(3812411695, 2320668415), Long_create(1804891416, 3713069465),
    Long_create(1443913133, 2970455572), Long_create(3732110884, 2376364457), Long_create(2535403578, 3802183132), Long_create(310335944, 3041746506), Long_create(3684242592, 2433397204), Long_create(3317807769, 3893435527), Long_create(936259297, 3114748422), Long_create(3325987815, 2491798737), Long_create(1885606668, 3986877980), Long_create(1508485334, 3189502384), Long_create(2065781726, 2551601907), Long_create(4164244222, 4082563051), Long_create(2472401918, 3266050441), Long_create(1118928075, 2612840353),
    Long_create(931291461, 4180544565), Long_create(745033169, 3344435652), Long_create(3173006913, 2675548521), Long_create(3358824142, 4280877634), Long_create(3546052773, 3424702107), Long_create(1118855300, 2739761686), Long_create(36090780, 2191809349), Long_create(1775732167, 3506894958), Long_create(3138572652, 2805515966), Long_create(1651864662, 2244412773), Long_create(1783990001, 3591060437), Long_create(4004172378, 2872848349), Long_create(4062331362, 2298278679), Long_create(3922749802, 3677245887),
    Long_create(1420212923, 2941796710), Long_create(1136170338, 2353437368), Long_create(958879082, 3765499789), Long_create(1626096725, 3012399831), Long_create(441883920, 2409919865), Long_create(707014273, 3855871784), Long_create(1424604878, 3084697427), Long_create(3716664280, 2467757941), Long_create(4228675929, 3948412706), Long_create(2523947284, 3158730165), Long_create(2019157827, 2526984132), Long_create(4089645983, 4043174611), Long_create(2412723327, 3234539689), Long_create(2789172121, 2587631751),
    Long_create(2744688475, 4140210802), Long_create(477763862, 3312168642), Long_create(2959191467, 2649734913), Long_create(3875712888, 4239575861), Long_create(2241576851, 3391660689), Long_create(2652254940, 2713328551), Long_create(1262810493, 2170662841), Long_create(302509870, 3473060546), Long_create(3677981733, 2778448436), Long_create(2083391927, 2222758749), Long_create(756446706, 3556413999), Long_create(1464150824, 2845131199), Long_create(2030314118, 2276104959), Long_create(671522212, 3641767935),
    Long_create(537217769, 2913414348), Long_create(2147761134, 2330731478), Long_create(2577424355, 3729170365), Long_create(2061939484, 2983336292), Long_create(4226531965, 2386669033), Long_create(1608490388, 3818670454), Long_create(2145785770, 3054936363), Long_create(3434615534, 2443949090), Long_create(1200417559, 3910318545), Long_create(960334047, 3128254836), Long_create(4204241074, 2502603868), Long_create(1572824964, 4004166190), Long_create(1258259971, 3203332952), Long_create(3583588354, 2562666361),
    Long_create(4015754449, 4100266178), Long_create(635623181, 3280212943), Long_create(2226485463, 2624170354), Long_create(985396364, 4198672567), Long_create(3365297469, 3358938053), Long_create(115257597, 2687150443), Long_create(1810192996, 2149720354), Long_create(319328417, 3439552567), Long_create(2832443111, 2751642053), Long_create(3983941407, 2201313642), Long_create(2938332415, 3522101828), Long_create(4068652850, 2817681462), Long_create(1536935362, 2254145170), Long_create(2459096579, 3606632272),
    Long_create(249290345, 2885305818), Long_create(1917419194, 2308244654), Long_create(490890333, 3693191447), Long_create(2969692644, 2954553157), Long_create(657767197, 2363642526), Long_create(3629407892, 3781828041), Long_create(2044532855, 3025462433), Long_create(3353613202, 2420369946), Long_create(3647794205, 3872591914), Long_create(3777228823, 3098073531), Long_create(2162789599, 2478458825), Long_create(3460463359, 3965534120), Long_create(2768370687, 3172427296), Long_create(1355703090, 2537941837),
    Long_create(3028118404, 4060706939), Long_create(3281488183, 3248565551), Long_create(1766197087, 2598852441), Long_create(1107928421, 4158163906), Long_create(27349277, 3326531125), Long_create(21879422, 2661224900), Long_create(35007075, 4257959840), Long_create(28005660, 3406367872), Long_create(2599384905, 2725094297), Long_create(361521006, 2180075438), Long_create(4014407446, 3488120700), Long_create(3211525957, 2790496560), Long_create(2569220766, 2232397248), Long_create(3251759766, 3571835597),
    Long_create(883420894, 2857468478), Long_create(2424723634, 2285974782), Long_create(443583977, 3657559652), Long_create(2931847559, 2926047721), Long_create(1486484588, 2340838177), Long_create(3237368801, 3745341083), Long_create(12914663, 2996272867), Long_create(2587312108, 2397018293), Long_create(3280705914, 3835229269), Long_create(3483558190, 3068183415), Long_create(2786846552, 2454546732), Long_create(1022980646, 3927274772), Long_create(3395364895, 3141819817), Long_create(998304997, 2513455854),
    Long_create(3315274914, 4021529366), Long_create(1793226472, 3217223493), Long_create(3152568096, 2573778794), Long_create(2467128576, 4118046071), Long_create(1114709402, 3294436857), Long_create(3468747899, 2635549485), Long_create(1255029343, 4216879177), Long_create(3581003852, 3373503341), Long_create(2005809622, 2698802673), Long_create(3322634616, 2159042138), Long_create(162254630, 3454467422), Long_create(2706784082, 2763573937), Long_create(447440347, 2210859150), Long_create(715904555, 3537374640),
    Long_create(572723644, 2829899712), Long_create(3035159293, 2263919769), Long_create(2279274491, 3622271631), Long_create(964426134, 2897817305), Long_create(771540907, 2318253844), Long_create(2952452370, 3709206150), Long_create(2361961896, 2967364920), Long_create(1889569516, 2373891936), Long_create(1305324308, 3798227098), Long_create(2762246365, 3038581678), Long_create(3927784010, 2430865342), Long_create(2848480580, 3889384548), Long_create(3996771382, 3111507638), Long_create(620436728, 2489206111),
    Long_create(3569679143, 3982729777), Long_create(1137756396, 3186183822), Long_create(3487185494, 2548947057), Long_create(2143522954, 4078315292), Long_create(4291798741, 3262652233), Long_create(856458615, 2610121787), Long_create(2229327243, 4176194859), Long_create(2642455254, 3340955887), Long_create(395977285, 2672764710), Long_create(633563656, 4276423536), Long_create(3942824761, 3421138828), Long_create(577279431, 2736911063), Long_create(2179810463, 2189528850), Long_create(3487696741, 3503246160),
    Long_create(2790157393, 2802596928), Long_create(3950112833, 2242077542), Long_create(2884206696, 3587324068), Long_create(4025352275, 2869859254), Long_create(4079275279, 2295887403), Long_create(1372879692, 3673419846), Long_create(239310294, 2938735877), Long_create(2768428613, 2350988701), Long_create(2711498862, 3761581922), Long_create(451212171, 3009265538), Long_create(2078956655, 2407412430), Long_create(3326330649, 3851859888), Long_create(84084141, 3081487911), Long_create(3503241150, 2465190328),
    Long_create(451225085, 3944304526), Long_create(3796953905, 3155443620), Long_create(3037563124, 2524354896), Long_create(3142114080, 4038967834), Long_create(3372684723, 3231174267), Long_create(980160860, 2584939414), Long_create(3286244294, 4135903062), Long_create(911008517, 3308722450), Long_create(728806813, 2646977960), Long_create(1166090902, 4235164736), Long_create(73879262, 3388131789), Long_create(918096869, 2710505431), Long_create(4170451332, 2168404344), Long_create(4095741754, 3469446951),
    Long_create(2417599944, 2775557561), Long_create(1075086496, 2220446049), Long_create(3438125312, 3552713678), Long_create(173519872, 2842170943), Long_create(1856802816, 2273736754), Long_create(393904128, 3637978807), Long_create(2892103680, 2910383045), Long_create(2313682944, 2328306436), Long_create(1983905792, 3725290298), Long_create(3305111552, 2980232238), Long_create(67108864, 2384185791), Long_create(2684354560, 3814697265), Long_create(2147483648, 3051757812), Long_create(0, 2441406250), Long_create(0, 3906250000),
    Long_create(0, 3125000000), Long_create(0, 2500000000), Long_create(0, 4000000000), Long_create(0, 3200000000), Long_create(0, 2560000000), Long_create(0, 4096000000), Long_create(0, 3276800000), Long_create(0, 2621440000), Long_create(0, 4194304000), Long_create(0, 3355443200), Long_create(0, 2684354560), Long_create(0, 2147483648), Long_create(3435973836, 3435973836), Long_create(1889785610, 2748779069), Long_create(2370821947, 2199023255), Long_create(3793315115, 3518437208), Long_create(457671715, 2814749767),
    Long_create(2943117749, 2251799813), Long_create(3849994940, 3602879701), Long_create(2221002492, 2882303761), Long_create(917808535, 2305843009), Long_create(3186480574, 3689348814), Long_create(3408177918, 2951479051), Long_create(1867548875, 2361183241), Long_create(1270091283, 3777893186), Long_create(157079567, 3022314549), Long_create(984657113, 2417851639), Long_create(3293438299, 3868562622), Long_create(916763721, 3094850098), Long_create(2451397895, 2475880078), Long_create(3063243173, 3961408125),
    Long_create(2450594538, 3169126500), Long_create(1960475630, 2535301200), Long_create(3136761009, 4056481920), Long_create(2509408807, 3245185536), Long_create(1148533586, 2596148429), Long_create(3555640657, 4153837486), Long_create(1985519066, 3323069989), Long_create(2447408712, 2658455991), Long_create(2197867021, 4253529586), Long_create(899300158, 3402823669), Long_create(1578433585, 2722258935), Long_create(1262746868, 2177807148), Long_create(1161401530, 3484491437), Long_create(3506101601, 2787593149),
    Long_create(3663874740, 2230074519), Long_create(3285219207, 3568119231), Long_create(1769181906, 2854495385), Long_create(1415345525, 2283596308), Long_create(1405559381, 3653754093), Long_create(2842434423, 2923003274), Long_create(3132940998, 2338402619), Long_create(2435725219, 3741444191), Long_create(1089586716, 2993155353), Long_create(2589656291, 2394524282), Long_create(707476229, 3831238852), Long_create(3142961361, 3064991081), Long_create(1655375629, 2451992865), Long_create(2648601007, 3923188584),
    Long_create(2977874265, 3138550867), Long_create(664312493, 2510840694), Long_create(2780886908, 4017345110), Long_create(2224709526, 3213876088), Long_create(3497754539, 2571100870), Long_create(1301439967, 4113761393), Long_create(2759138892, 3291009114), Long_create(3066304573, 2632807291), Long_create(3188100398, 4212491666), Long_create(1691486859, 3369993333), Long_create(3071176406, 2695994666), Long_create(1597947665, 2156795733), Long_create(1697722806, 3450873173), Long_create(3076165163, 2760698538),
    Long_create(4178919049, 2208558830), Long_create(2391303182, 3533694129), Long_create(2772036005, 2826955303), Long_create(3935615722, 2261564242), Long_create(2861011319, 3618502788), Long_create(4006795973, 2894802230), Long_create(3205436779, 2315841784), Long_create(2551718468, 3705346855), Long_create(2041374775, 2964277484), Long_create(2492093279, 2371421987), Long_create(551375410, 3794275180), Long_create(441100328, 3035420144), Long_create(1211873721, 2428336115), Long_create(1938997954, 3885337784),
    Long_create(2410191822, 3108270227), Long_create(210166539, 2486616182), Long_create(1195259923, 3978585891), Long_create(97214479, 3182868713), Long_create(1795758501, 2546294970), Long_create(2873213602, 4074071952), Long_create(580583963, 3259257562), Long_create(3041447548, 2607406049), Long_create(2289335700, 4171849679), Long_create(2690462019, 3337479743), Long_create(3870356534, 2669983794), Long_create(3615590076, 4271974071), Long_create(2033478602, 3417579257), Long_create(4203763259, 2734063405),
    Long_create(3363010607, 2187250724), Long_create(2803836594, 3499601159), Long_create(3102062734, 2799680927), Long_create(763663269, 2239744742), Long_create(2080854690, 3583591587), Long_create(4241664129, 2866873269), Long_create(4252324763, 2293498615), Long_create(2508752324, 3669597785), Long_create(2007001859, 2935678228), Long_create(3323588406, 2348542582), Long_create(1881767613, 3757668132), Long_create(4082394468, 3006134505), Long_create(3265915574, 2404907604), Long_create(2648484541, 3847852167),
    Long_create(400800715, 3078281734), Long_create(1179634031, 2462625387), Long_create(2746407909, 3940200619), Long_create(3056119786, 3152160495), Long_create(2444895829, 2521728396), Long_create(2193846408, 4034765434), Long_create(2614070585, 3227812347), Long_create(373269550, 2582249878), Long_create(4033205117, 4131599804), Long_create(4085557553, 3305279843), Long_create(691465664, 2644223875), Long_create(1106345063, 4230758200), Long_create(885076050, 3384606560), Long_create(708060840, 2707685248),
    Long_create(2284435591, 2166148198), Long_create(2796103486, 3465837117), Long_create(518895870, 2772669694), Long_create(1274110155, 2218135755), Long_create(2038576249, 3549017208), Long_create(3348847917, 2839213766), Long_create(1820084875, 2271371013), Long_create(2053142340, 3634193621), Long_create(783520413, 2907354897), Long_create(3203796708, 2325883917), Long_create(1690100896, 3721414268), Long_create(3070067635, 2977131414), Long_create(3315047567, 2381705131), Long_create(3586089190, 3810728210),
    Long_create(2868871352, 3048582568), Long_create(4013084000, 2438866054), Long_create(3843954022, 3902185687), Long_create(1357176299, 3121748550), Long_create(1085741039, 2497398840), Long_create(1737185663, 3995838144), Long_create(2248741989, 3196670515), Long_create(1798993591, 2557336412), Long_create(3737383206, 4091738259), Long_create(3848900024, 3273390607), Long_create(1361133101, 2618712486), Long_create(459826043, 4189939978), Long_create(2085847752, 3351951982), Long_create(4245658579, 2681561585),
    Long_create(2498086431, 4290498537), Long_create(280482227, 3432398830), Long_create(224385781, 2745919064), Long_create(1038502084, 2196735251), Long_create(4238583712, 3514776401), Long_create(2531873511, 2811821121), Long_create(1166505349, 2249456897), Long_create(2725402018, 3599131035), Long_create(2180321615, 2879304828), Long_create(3462244210, 2303443862), Long_create(2103616899, 3685510180), Long_create(1682893519, 2948408144), Long_create(2205308275, 2358726515), Long_create(3528493240, 3773962424),
    Long_create(3681788051, 3019169939), Long_create(3804423900, 2415335951), Long_create(74124026, 3864537523), Long_create(1777286139, 3091630018), Long_create(3139815829, 2473304014), Long_create(2446724950, 3957286423), Long_create(3675366878, 3165829138), Long_create(363313125, 2532663311), Long_create(3158281377, 4052261297), Long_create(808638183, 3241809038), Long_create(2364897465, 2593447230), Long_create(3783835944, 4149515568), Long_create(450088378, 3319612455), Long_create(360070702, 2655689964),
    Long_create(2294100042, 4249103942), Long_create(117293115, 3399283154), Long_create(952827951, 2719426523), Long_create(2480249279, 2175541218), Long_create(3109405388, 3480865949), Long_create(3346517769, 2784692759), Long_create(3536207675, 2227754207), Long_create(2221958443, 3564406732), Long_create(59579836, 2851525386), Long_create(3483637705, 2281220308), Long_create(419859574, 3649952494), Long_create(1194881118, 2919961995), Long_create(955904894, 2335969596), Long_create(4106428209, 3737551353),
    Long_create(708162189, 2990041083), Long_create(2284516670, 2392032866), Long_create(1937239754, 3827252586), Long_create(690798344, 3061802069), Long_create(1411632134, 2449441655), Long_create(2258611415, 3919106648), Long_create(3524876050, 3135285318), Long_create(242920462, 2508228255), Long_create(388672740, 4013165208), Long_create(2028925110, 3210532166), Long_create(764146629, 2568425733), Long_create(363641147, 4109481173), Long_create(2008899836, 3287584938), Long_create(3325106787, 2630067950),
    Long_create(1025203564, 4208108721), Long_create(4256136688, 3366486976), Long_create(2545915891, 2693189581), Long_create(1177739254, 2154551665), Long_create(1884382806, 3447282664), Long_create(2366499704, 2757826131), Long_create(1034206304, 2206260905), Long_create(1654730086, 3530017448), Long_create(3041770987, 2824013958), Long_create(4151403708, 2259211166), Long_create(629291719, 3614737867), Long_create(3080413753, 2891790293), Long_create(4182317920, 2313432234), Long_create(4114728295, 3701491575),
    Long_create(3291782636, 2961193260), Long_create(2633426109, 2368954608), Long_create(3354488315, 3790327373), Long_create(106610275, 3032261899), Long_create(944281679, 2425809519), Long_create(3228837605, 3881295230), Long_create(2583070084, 3105036184), Long_create(2925449526, 2484028947), Long_create(1244745405, 3974446316), Long_create(136802865, 3179557053), Long_create(1827429210, 2543645642), Long_create(3782880196, 4069833027), Long_create(1308317238, 3255866422), Long_create(3623634168, 2604693137),
    Long_create(2361840832, 4167509020), Long_create(1889472666, 3334007216), Long_create(652584673, 2667205773), Long_create(185142018, 4267529237), Long_create(2725093992, 3414023389), Long_create(3039068653, 2731218711), Long_create(1572261463, 2184974969), Long_create(4233605259, 3495959950), Long_create(3386884207, 2796767960), Long_create(2709507366, 2237414368), Long_create(3476218326, 3579862989), Long_create(3639968120, 2863890391), Long_create(2052981037, 2291112313), Long_create(2425776200, 3665779701),
    Long_create(1081627501, 2932623761), Long_create(6308541, 2346099009), Long_create(1728080585, 3753758414), Long_create(2241457927, 3003006731), Long_create(934172882, 2402405385), Long_create(1494676612, 3843848616), Long_create(336747830, 3075078893), Long_create(1987385183, 2460063114), Long_create(602835915, 3936100983), Long_create(2200255650, 3148880786), Long_create(901211061, 2519104629), Long_create(3159924616, 4030567406), Long_create(1668946233, 3224453925), Long_create(1335156987, 2579563140),
    Long_create(2136251179, 4127301024), Long_create(2567994402, 3301840819), Long_create(2913388981, 2641472655), Long_create(366455074, 4226356249), Long_create(1152157518, 3381084999), Long_create(1780719474, 2704867999), Long_create(2283569038, 2163894399), Long_create(1076730083, 3462231039), Long_create(1720377526, 2769784831), Long_create(517308561, 2215827865), Long_create(827693699, 3545324584), Long_create(1521148418, 2836259667), Long_create(3793899112, 2269007733), Long_create(916277824, 3630412374),
    Long_create(1592015718, 2904329899), Long_create(2132606034, 2323463919), Long_create(835189277, 3717542271), Long_create(4104125258, 2974033816), Long_create(2424306747, 2379227053), Long_create(3019897337, 3806763285), Long_create(2415917869, 3045410628), Long_create(3650721214, 2436328502), Long_create(2405180105, 3898125604), Long_create(2783137543, 3118500483), Long_create(3944496953, 2494800386), Long_create(298240911, 3991680619), Long_create(1097586188, 3193344495), Long_create(878068950, 2554675596),
    Long_create(3981890698, 4087480953), Long_create(608532181, 3269984763), Long_create(2204812663, 2615987810), Long_create(3527700261, 4185580496), Long_create(1963166749, 3348464397), Long_create(4147513777, 2678771517), Long_create(3200048207, 4286034428), Long_create(4278025484, 3428827542), Long_create(1704433468, 2743062034), Long_create(2222540234, 2194449627), Long_create(120090538, 3511119404), Long_create(955065889, 2808895523), Long_create(2482039630, 2247116418), Long_create(3112269949, 3595386269),
    Long_create(3348809418, 2876309015), Long_create(2679047534, 2301047212), Long_create(850502218, 3681675540), Long_create(680401775, 2945340432), Long_create(3121301797, 2356272345), Long_create(699115580, 3770035753), Long_create(2277279382, 3016028602), Long_create(103836587, 2412822882), Long_create(1025131999, 3860516611), Long_create(4256079436, 3088413288), Long_create(827883168, 2470730631), Long_create(3901593088, 3953169009)]);
    otcit_DoubleAnalyzer_exp10Table = $rt_createShortArrayFromData([(-70), (-66), (-63), (-60), (-56), (-53), (-50), (-46), (-43), (-40), (-36), (-33), (-30), (-26), (-23), (-20), (-16), (-13), (-10), (-6), (-3), 0, 4, 7, 10, 14, 17, 20, 23, 27, 30, 33, 37, 40, 43, 47, 50, 53, 57, 60, 63, 67, 70, 73, 77, 80, 83, 87, 90, 93, 97, 100, 103, 107, 110, 113, 116, 120, 123, 126, 130, 133, 136, 140, 143, 146, 150, 153, 156, 160, 163, 166, 170, 173, 176, 180, 183, 186, 190, 193, 196, 200, 203, 206, 210, 213, 216, 219,
    223, 226, 229, 233, 236, 239, 243, 246, 249, 253, 256, 259, 263, 266, 269, 273, 276, 279, 283, 286, 289, 293, 296, 299, 303, 306, 309, 312, 316, 319, 322, 326, 329, 332, 336, 339, 342, 346, 349, 352, 356, 359, 362, 366, 369, 372, 376, 379, 382, 386, 389, 392, 396, 399, 402, 406, 409, 412, 415, 419, 422, 425, 429, 432, 435, 439, 442, 445, 449, 452, 455, 459, 462, 465, 469, 472, 475, 479, 482, 485, 489, 492, 495, 499, 502, 505, 508, 512, 515, 518, 522, 525, 528, 532, 535, 538, 542, 545, 548, 552, 555, 558,
    562, 565, 568, 572, 575, 578, 582, 585, 588, 592, 595, 598, 601, 605, 608, 611, 615, 618, 621, 625, 628, 631, 635, 638, 641, 645, 648, 651, 655, 658, 661, 665, 668, 671, 675, 678, 681, 685, 688, 691, 695, 698, 701, 704, 708, 711, 714, 718, 721, 724, 728, 731, 734, 738, 741, 744, 748, 751, 754, 758, 761, 764, 768, 771, 774, 778, 781, 784, 788, 791, 794, 797, 801, 804, 807, 811, 814, 817, 821, 824, 827, 831, 834, 837, 841, 844, 847, 851, 854, 857, 861, 864, 867, 871, 874, 877, 881, 884, 887, 891, 894, 897,
    900, 904, 907, 910, 914, 917, 920, 924, 927, 930, 934, 937, 940, 944, 947, 950, 954, 957, 960, 964, 967, 970, 974, 977, 980, 984, 987, 990, 993, 997, 1000, 1003, 1007, 1010, 1013, 1017, 1020, 1023, 1027, 1030, 1033, 1037, 1040, 1043, 1047, 1050, 1053, 1057, 1060, 1063, 1067, 1070, 1073, 1077, 1080, 1083, 1086, 1090, 1093, 1096, 1100, 1103, 1106, 1110, 1113, 1116, 1120, 1123, 1126, 1130, 1133, 1136, 1140, 1143, 1146, 1150, 1153, 1156, 1160, 1163, 1166, 1170, 1173, 1176, 1180, 1183, 1186, 1189, 1193, 1196,
    1199, 1203, 1206, 1209, 1213, 1216, 1219, 1223, 1226, 1229, 1233, 1236, 1239, 1243, 1246, 1249, 1253, 1256, 1259, 1263, 1266, 1269, 1273, 1276, 1279, 1282, 1286, 1289, 1292, 1296, 1299, 1302, 1306, 1309, 1312, 1316, 1319, 1322, 1326, 1329, 1332, 1336, 1339, 1342, 1346, 1349, 1352, 1356, 1359, 1362, 1366, 1369, 1372, 1376, 1379, 1382, 1385, 1389, 1392, 1395, 1399, 1402, 1405, 1409, 1412, 1415, 1419, 1422, 1425, 1429, 1432, 1435, 1439, 1442, 1445, 1449, 1452, 1455, 1459, 1462, 1465, 1469, 1472, 1475, 1478,
    1482, 1485, 1488, 1492, 1495, 1498, 1502, 1505, 1508, 1512, 1515, 1518, 1522, 1525, 1528, 1532, 1535, 1538, 1542, 1545, 1548, 1552, 1555, 1558, 1562, 1565, 1568, 1572, 1575, 1578, 1581, 1585, 1588, 1591, 1595, 1598, 1601, 1605, 1608, 1611, 1615, 1618, 1621, 1625, 1628, 1631, 1635, 1638, 1641, 1645, 1648, 1651, 1655, 1658, 1661, 1665, 1668, 1671, 1674, 1678, 1681, 1684, 1688, 1691, 1694, 1698, 1701, 1704, 1708, 1711, 1714, 1718, 1721, 1724, 1728, 1731, 1734, 1738, 1741, 1744, 1748, 1751, 1754, 1758, 1761,
    1764, 1767, 1771, 1774, 1777, 1781, 1784, 1787, 1791, 1794, 1797, 1801, 1804, 1807, 1811, 1814, 1817, 1821, 1824, 1827, 1831, 1834, 1837, 1841, 1844, 1847, 1851, 1854, 1857, 1861, 1864, 1867, 1870, 1874, 1877, 1880, 1884, 1887, 1890, 1894, 1897, 1900, 1904, 1907, 1910, 1914, 1917, 1920, 1924, 1927, 1930, 1934, 1937, 1940, 1944, 1947, 1950, 1954, 1957, 1960, 1963, 1967, 1970, 1973, 1977, 1980, 1983, 1987, 1990, 1993, 1997, 2000, 2003, 2007, 2010, 2013, 2017, 2020, 2023, 2027, 2030, 2033, 2037, 2040, 2043,
    2047, 2050, 2053, 2057, 2060, 2063, 2066, 2070, 2073, 2076, 2080, 2083, 2086, 2090, 2093, 2096, 2100, 2103, 2106, 2110, 2113, 2116, 2120]);
},
otr_StringInfo = $rt_classWithoutFields(otrr_ReflectionInfo),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6_accept0 = (var$0, var$1) => {
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6_accept(var$0, var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6_accept = (var$0, var$1) => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$6(var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7_get0 = var$0 => {
    return d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7_get(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7_get = var$0 => {
    return d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$7();
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4_get0 = var$0 => {
    return d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4_get(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4_get = var$0 => {
    return d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$4();
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5_apply0 = (var$0, var$1) => {
    return d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5_apply(var$0, var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5_apply = (var$0, var$1) => {
    return d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$5(var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8_apply0 = (var$0, var$1) => {
    return d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8_apply(var$0, var$1);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8_apply = (var$0, var$1) => {
    return d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$8(var$1);
},
d_WebSocketTest$Listener = $rt_classWithoutFields(),
d_WebSocketTest$Listener__init_ = $this => {
    jl_Object__init_($this);
},
d_WebSocketTest$Listener__init_0 = () => {
    let var_0 = new d_WebSocketTest$Listener();
    d_WebSocketTest$Listener__init_(var_0);
    return var_0;
},
d_WebSocketTest$Listener_onOpen = ($this, $ws) => {
    d_WebSocketTest_$callClinit();
    d_WebSocketTest_events.$add($rt_s(140));
    $ws.$request(Long_fromInt(1));
},
d_WebSocketTest$Listener_onText = ($this, $ws, $data, $last) => {
    let var$4, var$5, var$6;
    d_WebSocketTest_$callClinit();
    var$4 = d_WebSocketTest_events;
    var$5 = jl_String_valueOf($data);
    var$6 = jl_StringBuilder__init_();
    jl_StringBuilder_append2(jl_StringBuilder_append1(jl_StringBuilder_append(jl_StringBuilder_append(var$6, $rt_s(141)), var$5), 58), $last);
    var$4.$add(jl_StringBuilder_toString(var$6));
    d_WebSocketTest_check($rt_s(142), $last);
    return null;
},
d_WebSocketTest$Listener_onClose = ($this, $ws, $code, $reason) => {
    let var$4, var$5;
    d_WebSocketTest_$callClinit();
    var$4 = d_WebSocketTest_events;
    var$5 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append1(jl_StringBuilder_append0(jl_StringBuilder_append(var$5, $rt_s(143)), $code), 58), $reason);
    var$4.$add(jl_StringBuilder_toString(var$5));
    return null;
},
d_WebSocketTest$Listener_onError = ($this, $ws, $t) => {
    d_WebSocketTest_$callClinit();
    d_WebSocketTest_events.$add($rt_s(144));
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9 = $rt_classWithoutFields(),
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9();
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9_accept0 = (var$0, var$1) => {
    d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9_accept(var$0, var$1);
};
let d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9_accept = (var$0, var$1) => {
    d_ConcurrencyTest_lambda$deferredWorkActuallyRuns$9(var$1);
};
function otci_CharFlow() {
    let a = this; jl_Object.call(a);
    a.$characters = null;
    a.$pointer = 0;
}
let otci_CharFlow__init_ = ($this, $characters) => {
    jl_Object__init_($this);
    $this.$characters = $characters;
},
otci_CharFlow__init_0 = var_0 => {
    let var_1 = new otci_CharFlow();
    otci_CharFlow__init_(var_1, var_0);
    return var_1;
};
function d_ConcurrencyTest$executeIsDeferred$lambda$_6_0() {
    jl_Object.call(this);
    this.$_020 = null;
}
let d_ConcurrencyTest$executeIsDeferred$lambda$_6_0__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_020 = var$1;
},
d_ConcurrencyTest$executeIsDeferred$lambda$_6_0__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$executeIsDeferred$lambda$_6_0();
    d_ConcurrencyTest$executeIsDeferred$lambda$_6_0__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$executeIsDeferred$lambda$_6_0_run = var$0 => {
    d_ConcurrencyTest_lambda$executeIsDeferred$14(var$0.$_020);
},
c_EventLoop = $rt_classWithoutFields(),
c_EventLoop_defer$js_body$_1 = var$1 => {
    return setTimeout(function() {
        var$1();
    }, 0);
},
c_EventLoop_delay$js_body$_2 = (var$1, var$2) => {
    return setTimeout(function() {
        var$1();
    }, var$2);
},
c_EventLoop_repeat$js_body$_3 = (var$1, var$2) => {
    return setInterval(function() {
        var$1();
    }, var$2);
},
d_ConcurrencyTest$completableFailure$lambda$_10_0 = $rt_classWithoutFields(),
d_ConcurrencyTest$completableFailure$lambda$_10_0__init_ = var$0 => {
    jl_Object__init_(var$0);
},
d_ConcurrencyTest$completableFailure$lambda$_10_0__init_0 = () => {
    let var_0 = new d_ConcurrencyTest$completableFailure$lambda$_10_0();
    d_ConcurrencyTest$completableFailure$lambda$_10_0__init_(var_0);
    return var_0;
},
d_ConcurrencyTest$completableFailure$lambda$_10_0_apply0 = (var$0, var$1) => {
    return d_ConcurrencyTest$completableFailure$lambda$_10_0_apply(var$0, var$1);
},
d_ConcurrencyTest$completableFailure$lambda$_10_0_apply = (var$0, var$1) => {
    return d_ConcurrencyTest_lambda$completableFailure$20(var$1);
};
function d_ConcurrencyTest$completableFailure$lambda$_10_1() {
    jl_Object.call(this);
    this.$_026 = null;
}
let d_ConcurrencyTest$completableFailure$lambda$_10_1__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_026 = var$1;
},
d_ConcurrencyTest$completableFailure$lambda$_10_1__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$completableFailure$lambda$_10_1();
    d_ConcurrencyTest$completableFailure$lambda$_10_1__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$completableFailure$lambda$_10_1_accept0 = (var$0, var$1) => {
    d_ConcurrencyTest$completableFailure$lambda$_10_1_accept(var$0, var$1);
},
d_ConcurrencyTest$completableFailure$lambda$_10_1_accept = (var$0, var$1) => {
    d_ConcurrencyTest_lambda$completableFailure$21(var$0.$_026, var$1);
};
function d_ConcurrencyTest$completableFailure$lambda$_10_2() {
    jl_Object.call(this);
    this.$_044 = null;
}
let d_ConcurrencyTest$completableFailure$lambda$_10_2__init_ = (var$0, var$1) => {
    jl_Object__init_(var$0);
    var$0.$_044 = var$1;
},
d_ConcurrencyTest$completableFailure$lambda$_10_2__init_0 = var_0 => {
    let var_1 = new d_ConcurrencyTest$completableFailure$lambda$_10_2();
    d_ConcurrencyTest$completableFailure$lambda$_10_2__init_(var_1, var_0);
    return var_1;
},
d_ConcurrencyTest$completableFailure$lambda$_10_2_accept0 = (var$0, var$1, var$2) => {
    d_ConcurrencyTest$completableFailure$lambda$_10_2_accept(var$0, var$1, var$2);
},
d_ConcurrencyTest$completableFailure$lambda$_10_2_accept = (var$0, var$1, var$2) => {
    d_ConcurrencyTest_lambda$completableFailure$22(var$0.$_044, var$1, var$2);
};
function a_FontMetrics() {
    let a = this; jl_Object.call(a);
    a.$g0 = null;
    a.$font = null;
}
let a_FontMetrics__init_ = ($this, $g, $font) => {
    jl_Object__init_($this);
    $this.$g0 = $g;
    $this.$font = $font;
},
a_FontMetrics__init_0 = (var_0, var_1) => {
    let var_2 = new a_FontMetrics();
    a_FontMetrics__init_(var_2, var_0, var_1);
    return var_2;
},
a_FontMetrics_stringWidth = ($this, $s) => {
    if ($s !== null && !jl_String_isEmpty($s))
        return jl_Math_ceil($this.$g0.$measureTextWidth($s)) | 0;
    return 0;
},
a_FontMetrics_charWidth = ($this, $c) => {
    return $this.$stringWidth(jl_String_valueOf0($c));
};
function juc_TimeUnit() {
    jl_Enum.call(this);
    this.$nanoseconds = Long_ZERO;
}
let juc_TimeUnit_NANOSECONDS = null,
juc_TimeUnit_MICROSECONDS = null,
juc_TimeUnit_MILLISECONDS = null,
juc_TimeUnit_SECONDS = null,
juc_TimeUnit_MINUTES = null,
juc_TimeUnit_HOURS = null,
juc_TimeUnit_DAYS = null,
juc_TimeUnit_$VALUES = null,
juc_TimeUnit_$callClinit = () => {
    juc_TimeUnit_$callClinit = $rt_eraseClinit(juc_TimeUnit);
    juc_TimeUnit__clinit_();
},
juc_TimeUnit__init_0 = ($this, var$1, var$2, $nanoseconds) => {
    juc_TimeUnit_$callClinit();
    jl_Enum__init_($this, var$1, var$2);
    $this.$nanoseconds = $nanoseconds;
},
juc_TimeUnit__init_ = (var_0, var_1, var_2) => {
    let var_3 = new juc_TimeUnit();
    juc_TimeUnit__init_0(var_3, var_0, var_1, var_2);
    return var_3;
},
juc_TimeUnit_convert = ($this, $sourceDuration, $sourceUnit) => {
    let $sourceNanos, $targetNanos;
    $sourceNanos = $sourceUnit.$nanoseconds;
    $targetNanos = $this.$nanoseconds;
    if (Long_ge($sourceNanos, $targetNanos))
        return Long_mul($sourceDuration, Long_div($sourceNanos, $targetNanos));
    return Long_div($sourceDuration, Long_div($targetNanos, $sourceNanos));
},
juc_TimeUnit_toMillis = ($this, $duration) => {
    juc_TimeUnit_$callClinit();
    return juc_TimeUnit_convert(juc_TimeUnit_MILLISECONDS, $duration, $this);
},
juc_TimeUnit_$values = () => {
    let var$1, var$2;
    juc_TimeUnit_$callClinit();
    var$1 = $rt_createArray(juc_TimeUnit, 7);
    var$2 = var$1.data;
    var$2[0] = juc_TimeUnit_NANOSECONDS;
    var$2[1] = juc_TimeUnit_MICROSECONDS;
    var$2[2] = juc_TimeUnit_MILLISECONDS;
    var$2[3] = juc_TimeUnit_SECONDS;
    var$2[4] = juc_TimeUnit_MINUTES;
    var$2[5] = juc_TimeUnit_HOURS;
    var$2[6] = juc_TimeUnit_DAYS;
    return var$1;
},
juc_TimeUnit__clinit_ = () => {
    juc_TimeUnit_NANOSECONDS = juc_TimeUnit__init_($rt_s(145), 0, Long_fromInt(1));
    juc_TimeUnit_MICROSECONDS = juc_TimeUnit__init_($rt_s(146), 1, Long_fromInt(1000));
    juc_TimeUnit_MILLISECONDS = juc_TimeUnit__init_($rt_s(147), 2, Long_fromInt(1000000));
    juc_TimeUnit_SECONDS = juc_TimeUnit__init_($rt_s(148), 3, Long_fromInt(1000000000));
    juc_TimeUnit_MINUTES = juc_TimeUnit__init_($rt_s(149), 4, Long_create(4165425152, 13));
    juc_TimeUnit_HOURS = juc_TimeUnit__init_($rt_s(150), 5, Long_create(817405952, 838));
    juc_TimeUnit_DAYS = juc_TimeUnit__init_($rt_s(151), 6, Long_create(2437873664, 20116));
    juc_TimeUnit_$VALUES = juc_TimeUnit_$values();
},
otcit_FloatAnalyzer$Result = $rt_classWithoutFields(),
otcit_FloatAnalyzer$Result__init_ = $this => {
    jl_Object__init_($this);
},
otcit_FloatAnalyzer$Result__init_0 = () => {
    let var_0 = new otcit_FloatAnalyzer$Result();
    otcit_FloatAnalyzer$Result__init_(var_0);
    return var_0;
},
otrr_ClassInfo = $rt_classWithoutFields(otrr_ReflectionInfo),
otrr_ClassInfo_newArrayInstance = (var$0, var$1) => {
    switch (var$0.primitiveKind) {
        default: return $rt_createArray(var$0, var$1);
    }
},
ae_ComponentListener = $rt_classWithoutFields(0);
function a_Graphics2D() {
    let a = this; a_Graphics.call(a);
    a.$ctx = null;
    a.$currentColor = null;
    a.$currentPaint = null;
    a.$currentFont = null;
    a.$currentComposite = null;
    a.$currentStroke = null;
    a.$currentClip = null;
    a.$clipDepth = 0;
    a.$ownsSave = 0;
    a.$canvasSink = null;
}
let a_Graphics2D__init_ = (var$0, var$1) => {
    let var$2;
    a_Graphics__init_(var$0);
    a_Color_$callClinit();
    var$0.$currentColor = a_Color_BLACK;
    var$0.$currentPaint = null;
    var$0.$currentFont = a_Font__init_($rt_s(22), 0, 12);
    var$0.$currentComposite = a_AlphaComposite_getInstance(3, 1.0);
    var$0.$currentStroke = a_BasicStroke__init_(1.0);
    var$0.$currentClip = null;
    var$0.$clipDepth = 0;
    var$0.$ownsSave = 0;
    var$0.$canvasSink = a_Graphics2D$1__init_0(var$0);
    var$0.$ctx = var$1;
    var$2 = "alphabetic";
    var$1.textBaseline = var$2;
    var$2 = $rt_ustr(var$0.$currentFont.$toCss());
    var$1.font = var$2;
},
a_Graphics2D__init_0 = var_0 => {
    let var_1 = new a_Graphics2D();
    a_Graphics2D__init_(var_1, var_0);
    return var_1;
},
a_Graphics2D_setColor = ($this, $c) => {
    let $css, var$3, var$4;
    if ($c === null)
        return;
    $this.$currentColor = $c;
    $this.$currentPaint = null;
    $css = $c.$toCss();
    var$3 = $this.$ctx;
    var$4 = $rt_ustr($css);
    var$3.fillStyle = var$4;
    var$3 = $this.$ctx;
    var$4 = $rt_ustr($css);
    var$3.strokeStyle = var$4;
},
a_Graphics2D_setPaint = ($this, $p) => {
    let $gp, $grad;
    if ($p === null)
        return;
    $this.$currentPaint = $p;
    if ($p instanceof a_Color) {
        $this.$setColor($p);
        return;
    }
    if ($p instanceof a_GradientPaint) {
        $gp = $p;
        $grad = $this.$ctx.createLinearGradient($gp.$x10, $gp.$y10, $gp.$x20, $gp.$y20);
        $grad.addColorStop(0.0, $rt_ustr($gp.$c1.$toCss()));
        $grad.addColorStop(1.0, $rt_ustr($gp.$c2.$toCss()));
        $this.$ctx.fillStyle = $grad;
        $this.$ctx.strokeStyle = $grad;
    }
},
a_Graphics2D_setStroke = ($this, $s) => {
    let $bs;
    $this.$currentStroke = $s;
    if ($s instanceof a_BasicStroke) {
        $bs = $s;
        $this.$ctx.lineWidth = $bs.$getLineWidth();
        $this.$ctx.lineCap = $rt_ustr($bs.$capCss());
        $this.$ctx.lineJoin = $rt_ustr($bs.$joinCss());
    }
},
a_Graphics2D_setComposite = ($this, $c) => {
    let var$2, var$3;
    if ($c === null)
        return;
    $this.$currentComposite = $c;
    var$2 = $this.$ctx;
    var$3 = $c.$getAlpha();
    var$2.globalAlpha = var$3;
},
a_Graphics2D_getComposite = $this => {
    return $this.$currentComposite;
},
a_Graphics2D_setFont = ($this, $f) => {
    let var$2, var$3;
    if ($f === null)
        return;
    $this.$currentFont = $f;
    var$2 = $this.$ctx;
    var$3 = $rt_ustr($f.$toCss());
    var$2.font = var$3;
},
a_Graphics2D_getFont = $this => {
    return $this.$currentFont;
},
a_Graphics2D_getFontMetrics = $this => {
    return a_FontMetrics__init_0($this, $this.$currentFont);
},
a_Graphics2D_measureTextWidth = ($this, $s) => {
    return $this.$ctx.measureText($rt_ustr($s)).width;
},
a_Graphics2D_drawString = ($this, $s, $x, $y) => {
    let var$4, var$5, var$6;
    if ($s === null)
        return;
    var$4 = $this.$ctx;
    var$5 = $x;
    var$6 = $y;
    var$4.fillText($rt_ustr($s), var$5, var$6);
},
a_Graphics2D_fillRect = ($this, $x, $y, $w, $h) => {
    let var$5, var$6, var$7, var$8, var$9;
    var$5 = $this.$ctx;
    var$6 = $x;
    var$7 = $y;
    var$8 = $w;
    var$9 = $h;
    var$5.fillRect(var$6, var$7, var$8, var$9);
},
a_Graphics2D_fillRoundRect = ($this, $x, $y, $w, $h, $aw, $ah) => {
    $this.$roundRectPath($x, $y, $w, $h, $aw / 2.0, $ah / 2.0);
    $this.$ctx.fill();
},
a_Graphics2D_drawRoundRect = ($this, $x, $y, $w, $h, $aw, $ah) => {
    $this.$roundRectPath($x, $y, $w, $h, $aw / 2.0, $ah / 2.0);
    $this.$ctx.stroke();
},
a_Graphics2D_roundRectPath = ($this, $x, $y, $w, $h, $rx, $ry) => {
    let $r, var$8, var$9, var$10, var$11, var$12, var$13, var$14;
    $r = jl_Math_min0(jl_Math_min0($rx, $ry), jl_Math_min0($w / 2.0, $h / 2.0));
    $this.$ctx.beginPath();
    var$8 = $this.$ctx;
    var$9 = $x + $r;
    var$8.moveTo(var$9, $y);
    var$8 = $this.$ctx;
    var$10 = $x + $w;
    var$11 = var$10 - $r;
    var$8.lineTo(var$11, $y);
    var$8 = $this.$ctx;
    var$12 = $y + $r;
    var$8.quadraticCurveTo(var$10, $y, var$10, var$12);
    var$8 = $this.$ctx;
    var$13 = $y + $h;
    var$14 = var$13 - $r;
    var$8.lineTo(var$10, var$14);
    $this.$ctx.quadraticCurveTo(var$10, var$13, var$11, var$13);
    $this.$ctx.lineTo(var$9, var$13);
    $this.$ctx.quadraticCurveTo($x, var$13, $x, var$14);
    $this.$ctx.lineTo($x, var$12);
    $this.$ctx.quadraticCurveTo($x, $y, var$9, $y);
    $this.$ctx.closePath();
},
a_Graphics2D_ovalPath = ($this, $x, $y, $w, $h) => {
    let var$5, var$6, var$7, var$8, var$9;
    $this.$ctx.beginPath();
    var$5 = $this.$ctx;
    var$6 = $x;
    var$7 = $w / 2.0;
    var$6 = var$6 + var$7;
    var$8 = $y;
    var$9 = $h / 2.0;
    var$8 = var$8 + var$9;
    var$5.ellipse(var$6, var$8, var$7, var$9, 0.0, 0.0, 6.283185307179586);
},
a_Graphics2D_fillOval = ($this, $x, $y, $w, $h) => {
    a_Graphics2D_ovalPath($this, $x, $y, $w, $h);
    $this.$ctx.fill();
},
a_Graphics2D_drawOval = ($this, $x, $y, $w, $h) => {
    a_Graphics2D_ovalPath($this, $x, $y, $w, $h);
    $this.$ctx.stroke();
},
a_Graphics2D_drawLine = ($this, $x1, $y1, $x2, $y2) => {
    let var$5, var$6, var$7, var$8;
    $this.$ctx.beginPath();
    var$5 = $this.$ctx;
    var$6 = $x1;
    var$7 = $y1;
    var$5.moveTo(var$6, var$7);
    var$8 = $this.$ctx;
    var$6 = $x2;
    var$7 = $y2;
    var$8.lineTo(var$6, var$7);
    $this.$ctx.stroke();
},
a_Graphics2D_polyPath = ($this, $xs, $ys, $n, $close) => {
    let var$5, var$6, var$7, var$8, var$9, $i, var$11;
    if ($n <= 0)
        return;
    var$5 = $ys.data;
    var$6 = $xs.data;
    $this.$ctx.beginPath();
    var$7 = $this.$ctx;
    var$8 = var$6[0];
    var$9 = var$5[0];
    var$7.moveTo(var$8, var$9);
    $i = 1;
    while ($i < $n) {
        var$11 = $this.$ctx;
        var$9 = var$6[$i];
        var$8 = var$5[$i];
        var$11.lineTo(var$9, var$8);
        $i = $i + 1 | 0;
    }
    if ($close)
        $this.$ctx.closePath();
},
a_Graphics2D_fillPolygon = ($this, $xs, $ys, $n) => {
    a_Graphics2D_polyPath($this, $xs, $ys, $n, 1);
    $this.$ctx.fill();
},
a_Graphics2D_clip = ($this, $s) => {
    if ($s === null)
        return;
    $this.$ctx.save();
    $this.$clipDepth = $this.$clipDepth + 1 | 0;
    $s.$trace($this);
    $this.$ctx.clip();
    $this.$currentClip = $s;
},
a_Graphics2D_getClip = $this => {
    return $this.$currentClip;
},
a_Graphics2D_setClip = ($this, $s) => {
    while ($this.$clipDepth > 0) {
        $this.$ctx.restore();
        $this.$clipDepth = $this.$clipDepth - 1 | 0;
    }
    $this.$currentClip = null;
    if ($s !== null)
        $this.$clip($s);
},
a_Graphics2D_translate = ($this, $x, $y) => {
    let var$3, var$4, var$5;
    var$3 = $this.$ctx;
    var$4 = $x;
    var$5 = $y;
    var$3.translate(var$4, var$5);
},
a_Graphics2D_scale = ($this, $sx, $sy) => {
    $this.$ctx.scale($sx, $sy);
},
a_Graphics2D_setRenderingHint = ($this, $key, $value) => {
    return;
},
a_Graphics2D_create = $this => {
    let $child;
    $this.$ctx.save();
    $child = a_Graphics2D__init_0($this.$ctx);
    $child.$ownsSave = 1;
    $child.$currentColor = $this.$currentColor;
    $child.$currentPaint = $this.$currentPaint;
    $child.$currentFont = $this.$currentFont;
    $child.$currentComposite = $this.$currentComposite;
    $child.$currentStroke = $this.$currentStroke;
    return $child;
},
a_Graphics2D_dispose = $this => {
    while ($this.$clipDepth > 0) {
        $this.$ctx.restore();
        $this.$clipDepth = $this.$clipDepth - 1 | 0;
    }
    if ($this.$ownsSave) {
        $this.$ctx.restore();
        $this.$ownsSave = 0;
    }
},
a_Graphics2D_sink = $this => {
    return $this.$canvasSink;
},
a_Graphics2D_fill = ($this, $s) => {
    if ($s === null)
        return;
    $this.$ctx.beginPath();
    $s.$emit($this.$canvasSink);
    $this.$ctx.fill();
},
a_Graphics2D_draw = ($this, $s) => {
    if ($s === null)
        return;
    $this.$ctx.beginPath();
    $s.$emit($this.$canvasSink);
    $this.$ctx.stroke();
};
$rt_packages([-1, "java", 0, "lang"
]);
$rt_metadata([jl_Object, "Object", 1, 0, [], 1, 0, 0, ["$getClass", $rt_wrapFunction0(jl_Object_getClass), "$equals", $rt_wrapFunction1(jl_Object_equals), "$toString", $rt_wrapFunction0(jl_Object_toString), "$identity", $rt_wrapFunction0(jl_Object_identity)],
otj_JSObject, 0, jl_Object, [], 1537, 0, 0, 0,
c_EventLoop$Task, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
c_ScheduledExecutorService$repeating$lambda$_5_1, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_9", $rt_wrapFunction1(c_ScheduledExecutorService$repeating$lambda$_5_1__init_), "$run", $rt_wrapFunction0(c_ScheduledExecutorService$repeating$lambda$_5_1_run)],
jl_Throwable, 0, jl_Object, [], 1, 0, 0, ["$fillInStackTrace", $rt_wrapFunction0(jl_Throwable_fillInStackTrace), "$getMessage", $rt_wrapFunction0(jl_Throwable_getMessage), "$getCause", $rt_wrapFunction0(jl_Throwable_getCause)],
jl_Exception, 0, jl_Throwable, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_Exception__init_1), "$_init_0", $rt_wrapFunction1(jl_Exception__init_), "$_init_1", $rt_wrapFunction1(jl_Exception__init_0)],
jl_RuntimeException, 0, jl_Exception, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_RuntimeException__init_), "$_init_0", $rt_wrapFunction1(jl_RuntimeException__init_0), "$_init_1", $rt_wrapFunction1(jl_RuntimeException__init_1)],
jl_IndexOutOfBoundsException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_IndexOutOfBoundsException__init_)],
ag_PathSink, 0, jl_Object, [], 1537, 0, 0, 0,
a_Graphics2D$1, 0, jl_Object, [ag_PathSink], 0, 0, 0, ["$_init_63", $rt_wrapFunction1(a_Graphics2D$1__init_), "$moveTo", $rt_wrapFunction2(a_Graphics2D$1_moveTo), "$lineTo", $rt_wrapFunction2(a_Graphics2D$1_lineTo), "$quadTo", $rt_wrapFunction4(a_Graphics2D$1_quadTo), "$curveTo", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_Graphics2D$1_curveTo(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$closePath", $rt_wrapFunction0(a_Graphics2D$1_closePath)],
a_Rectangle, 0, jl_Object, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(a_Rectangle__init_0), "$_init_2", $rt_wrapFunction4(a_Rectangle__init_), "$setBounds", $rt_wrapFunction4(a_Rectangle_setBounds), "$contains", $rt_wrapFunction2(a_Rectangle_contains)],
a_Stroke, 0, jl_Object, [], 1537, 0, 0, 0,
ji_Serializable, 0, jl_Object, [], 1537, 0, 0, 0,
jl_Number, 0, jl_Object, [ji_Serializable], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(jl_Number__init_)],
jl_Comparable, 0, jl_Object, [], 1537, 0, 0, 0,
jl_Integer, 0, jl_Number, [jl_Comparable], 1, 0, () => jl_Integer_$callClinit(), ["$_init_3", $rt_wrapFunction1(jl_Integer__init_), "$intValue", $rt_wrapFunction0(jl_Integer_intValue), "$equals", $rt_wrapFunction1(jl_Integer_equals)],
i_ImageIO$Callback, 0, jl_Object, [otj_JSObject], 1536, 0, 0, 0,
i_ImageIO$preload$lambda$_5_0, 0, jl_Object, [i_ImageIO$Callback], 1, 0, 0, ["$_init_17", $rt_wrapFunction2(i_ImageIO$preload$lambda$_5_0__init_), "$call", $rt_wrapFunction0(i_ImageIO$preload$lambda$_5_0_call)],
n_WebSocket$StringHandler, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
n_BrowserWebSocket$_init_$lambda$_0_1, 0, jl_Object, [n_WebSocket$StringHandler], 1, 0, 0, ["$_init_28", $rt_wrapFunction2(n_BrowserWebSocket$_init_$lambda$_0_1__init_), "$handle", $rt_wrapFunction1(n_BrowserWebSocket$_init_$lambda$_0_1_handle)],
jl_AbstractStringBuilder$Constants, 0, jl_Object, [], 0, 0, () => jl_AbstractStringBuilder$Constants_$callClinit(), 0,
n_WebSocket$CloseHandler, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
n_BrowserWebSocket$_init_$lambda$_0_2, 0, jl_Object, [n_WebSocket$CloseHandler], 1, 0, 0, ["$_init_28", $rt_wrapFunction2(n_BrowserWebSocket$_init_$lambda$_0_2__init_), "$handle0", $rt_wrapFunction2(n_BrowserWebSocket$_init_$lambda$_0_2_handle)],
n_WebSocket$VoidHandler, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
n_BrowserWebSocket$_init_$lambda$_0_0, 0, jl_Object, [n_WebSocket$VoidHandler], 1, 0, 0, ["$_init_27", $rt_wrapFunction3(n_BrowserWebSocket$_init_$lambda$_0_0__init_), "$handle1", $rt_wrapFunction0(n_BrowserWebSocket$_init_$lambda$_0_0_handle)],
jl_Long, 0, jl_Number, [jl_Comparable], 1, 0, () => jl_Long_$callClinit(), 0,
n_BrowserWebSocket$_init_$lambda$_0_3, 0, jl_Object, [n_WebSocket$VoidHandler], 1, 0, 0, ["$_init_27", $rt_wrapFunction3(n_BrowserWebSocket$_init_$lambda$_0_3__init_), "$handle1", $rt_wrapFunction0(n_BrowserWebSocket$_init_$lambda$_0_3_handle)],
ju_Map, 0, jl_Object, [], 1537, 0, 0, 0,
juc_Callable, 0, jl_Object, [], 1537, 0, 0, 0,
d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0, 0, jl_Object, [juc_Callable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0__init_), "$call2", $rt_wrapFunction0(d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0_call0), "$call0", $rt_wrapFunction0(d_ConcurrencyTest$submitRunsAndCompletes$lambda$_5_0_call)],
ae_MouseListener, 0, jl_Object, [], 1537, 0, 0, 0,
ae_MouseMotionListener, 0, jl_Object, [], 1537, 0, 0, 0,
ae_MouseWheelListener, 0, jl_Object, [], 1537, 0, 0, 0,
ae_MouseAdapter, 0, jl_Object, [ae_MouseListener, ae_MouseMotionListener, ae_MouseWheelListener], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ae_MouseAdapter__init_), "$mouseClicked", $rt_wrapFunction1(ae_MouseAdapter_mouseClicked), "$mousePressed", $rt_wrapFunction1(ae_MouseAdapter_mousePressed), "$mouseReleased", $rt_wrapFunction1(ae_MouseAdapter_mouseReleased), "$mouseEntered", $rt_wrapFunction1(ae_MouseAdapter_mouseEntered), "$mouseExited", $rt_wrapFunction1(ae_MouseAdapter_mouseExited), "$mouseMoved", $rt_wrapFunction1(ae_MouseAdapter_mouseMoved),
"$mouseDragged", $rt_wrapFunction1(ae_MouseAdapter_mouseDragged), "$mouseWheelMoved", $rt_wrapFunction1(ae_MouseAdapter_mouseWheelMoved)],
d_InteractivePanel$2, 0, ae_MouseAdapter, [], 0, 0, 0, ["$_init_51", $rt_wrapFunction1(d_InteractivePanel$2__init_), "$mouseClicked", $rt_wrapFunction1(d_InteractivePanel$2_mouseClicked), "$mouseExited", $rt_wrapFunction1(d_InteractivePanel$2_mouseExited)],
d_InteractivePanel$1, 0, ae_MouseAdapter, [], 0, 0, 0, ["$_init_51", $rt_wrapFunction1(d_InteractivePanel$1__init_), "$mouseMoved", $rt_wrapFunction1(d_InteractivePanel$1_mouseMoved)],
a_Paint, 0, jl_Object, [], 1537, 0, 0, 0,
a_Color, 0, jl_Object, [a_Paint], 1, 0, () => a_Color_$callClinit(), ["$_init_4", $rt_wrapFunction3(a_Color__init_2), "$_init_2", $rt_wrapFunction4(a_Color__init_0), "$brighter", $rt_wrapFunction0(a_Color_brighter), "$toCss", $rt_wrapFunction0(a_Color_toCss)],
ae_KeyListener, 0, jl_Object, [], 1537, 0, 0, 0,
ae_KeyAdapter, 0, jl_Object, [ae_KeyListener], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ae_KeyAdapter__init_), "$keyTyped", $rt_wrapFunction1(ae_KeyAdapter_keyTyped), "$keyReleased", $rt_wrapFunction1(ae_KeyAdapter_keyReleased)],
d_InteractivePanel$3, 0, ae_KeyAdapter, [], 0, 0, 0, ["$_init_51", $rt_wrapFunction1(d_InteractivePanel$3__init_), "$keyPressed", $rt_wrapFunction1(d_InteractivePanel$3_keyPressed)],
c_Future, 0, jl_Object, [], 1537, 0, 0, 0,
c_CompletionStage, 0, jl_Object, [], 1537, 0, 0, 0,
c_CompletableFuture, 0, jl_Object, [c_Future, c_CompletionStage], 1, 0, 0, ["$_init_", $rt_wrapFunction0(c_CompletableFuture__init_0), "$complete", $rt_wrapFunction1(c_CompletableFuture_complete), "$completeExceptionally", $rt_wrapFunction1(c_CompletableFuture_completeExceptionally), "$whenComplete", $rt_wrapFunction1(c_CompletableFuture_whenComplete), "$thenApply", $rt_wrapFunction1(c_CompletableFuture_thenApply), "$thenAccept", $rt_wrapFunction1(c_CompletableFuture_thenAccept), "$thenRun", $rt_wrapFunction1(c_CompletableFuture_thenRun),
"$exceptionally", $rt_wrapFunction1(c_CompletableFuture_exceptionally), "$join", $rt_wrapFunction0(c_CompletableFuture_join), "$isDone", $rt_wrapFunction0(c_CompletableFuture_isDone), "$isCompletedExceptionally", $rt_wrapFunction0(c_CompletableFuture_isCompletedExceptionally)],
c_ScheduledExecutorService$repeating$lambda$_5_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_45", $rt_wrapFunction2(c_ScheduledExecutorService$repeating$lambda$_5_0__init_), "$run", $rt_wrapFunction0(c_ScheduledExecutorService$repeating$lambda$_5_0_run)],
jl_CharSequence, 0, jl_Object, [], 1537, 0, 0, 0,
jl_StringIndexOutOfBoundsException, 0, jl_IndexOutOfBoundsException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_StringIndexOutOfBoundsException__init_0)],
ae_FocusListener, 0, jl_Object, [], 1537, 0, 0, 0,
otci_Base46, 0, jl_Object, [], 17, 0, 0, 0,
ju_Comparator, 0, jl_Object, [], 1537, 0, 0, 0]);
$rt_metadata([jl_String$_clinit_$lambda$_118_0, 0, jl_Object, [ju_Comparator], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_String$_clinit_$lambda$_118_0__init_)],
jl_AbstractStringBuilder, 0, jl_Object, [ji_Serializable, jl_CharSequence], 0, 0, 0, ["$_init_", $rt_wrapFunction0(jl_AbstractStringBuilder__init_0), "$_init_3", $rt_wrapFunction1(jl_AbstractStringBuilder__init_), "$_init_0", $rt_wrapFunction1(jl_AbstractStringBuilder__init_2), "$_init_10", $rt_wrapFunction1(jl_AbstractStringBuilder__init_1), "$append5", $rt_wrapFunction1(jl_AbstractStringBuilder_append3), "$append6", $rt_wrapFunction1(jl_AbstractStringBuilder_append), "$insert0", $rt_wrapFunction2(jl_AbstractStringBuilder_insert1),
"$append7", $rt_wrapFunction1(jl_AbstractStringBuilder_append0), "$append4", $rt_wrapFunction2(jl_AbstractStringBuilder_append5), "$insert1", $rt_wrapFunction3(jl_AbstractStringBuilder_insert4), "$append8", $rt_wrapFunction1(jl_AbstractStringBuilder_append2), "$insert2", $rt_wrapFunction2(jl_AbstractStringBuilder_insert0), "$append9", $rt_wrapFunction1(jl_AbstractStringBuilder_append4), "$insert3", $rt_wrapFunction2(jl_AbstractStringBuilder_insert3), "$insert", $rt_wrapFunction2(jl_AbstractStringBuilder_insert2),
"$append10", $rt_wrapFunction1(jl_AbstractStringBuilder_append1), "$insert4", $rt_wrapFunction2(jl_AbstractStringBuilder_insert), "$ensureCapacity", $rt_wrapFunction1(jl_AbstractStringBuilder_ensureCapacity), "$toString", $rt_wrapFunction0(jl_AbstractStringBuilder_toString)],
jl_Appendable, 0, jl_Object, [], 1537, 0, 0, 0,
jl_StringBuilder, 0, jl_AbstractStringBuilder, [jl_Appendable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_StringBuilder__init_1), "$_init_0", $rt_wrapFunction1(jl_StringBuilder__init_0), "$append", $rt_wrapFunction1(jl_StringBuilder_append), "$append11", $rt_wrapFunction1(jl_StringBuilder_append4), "$append1", $rt_wrapFunction1(jl_StringBuilder_append0), "$append2", $rt_wrapFunction1(jl_StringBuilder_append3), "$append0", $rt_wrapFunction1(jl_StringBuilder_append1), "$append3", $rt_wrapFunction1(jl_StringBuilder_append2),
"$insert8", $rt_wrapFunction2(jl_StringBuilder_insert4), "$insert6", $rt_wrapFunction2(jl_StringBuilder_insert5), "$insert5", $rt_wrapFunction2(jl_StringBuilder_insert1), "$insert7", $rt_wrapFunction2(jl_StringBuilder_insert2), "$insert9", $rt_wrapFunction2(jl_StringBuilder_insert6), "$toString", $rt_wrapFunction0(jl_StringBuilder_toString), "$ensureCapacity", $rt_wrapFunction1(jl_StringBuilder_ensureCapacity), "$insert4", $rt_wrapFunction2(jl_StringBuilder_insert7), "$insert", $rt_wrapFunction2(jl_StringBuilder_insert0),
"$insert3", $rt_wrapFunction2(jl_StringBuilder_insert), "$insert2", $rt_wrapFunction2(jl_StringBuilder_insert3), "$insert0", $rt_wrapFunction2(jl_StringBuilder_insert8)],
ju_ConcurrentModificationException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(ju_ConcurrentModificationException__init_)],
vr_RoomInfoCard, 0, jl_Object, [], 1, 0, () => vr_RoomInfoCard_$callClinit(), ["$_init_53", $rt_wrapFunction2(vr_RoomInfoCard__init_), "$draw0", $rt_wrapFunction1(vr_RoomInfoCard_draw), "$handleMouseMove", $rt_wrapFunction2(vr_RoomInfoCard_handleMouseMove), "$handleClick", $rt_wrapFunction2(vr_RoomInfoCard_handleClick), "$toggle", $rt_wrapFunction0(vr_RoomInfoCard_toggle), "$isVisible", $rt_wrapFunction0(vr_RoomInfoCard_isVisible)],
c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_9", $rt_wrapFunction1(c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0__init_), "$run", $rt_wrapFunction0(c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0_run)],
otjde_EventListener, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
a_Component$bindMouse$lambda$_22_0, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_0__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_0_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_0_handleEvent)],
a_Component$bindMouse$lambda$_22_1, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_1__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_1_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_1_handleEvent)],
i_ImageIO, 0, jl_Object, [], 17, 0, () => i_ImageIO_$callClinit(), 0,
jl_Runnable, 0, jl_Object, [], 1537, 0, 0, 0,
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_1_run)],
d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$invokeLaterOrdering$lambda$_12_0_run)],
n_WebSocket$Native, 0, jl_Object, [], 17, 0, 0, 0,
a_Component$bindMouse$lambda$_22_6, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_6__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_6_handleEvent0), "$handleEvent1", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_6_handleEvent)],
a_Component$bindMouse$lambda$_22_7, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_", $rt_wrapFunction0(a_Component$bindMouse$lambda$_22_7__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_7_handleEvent)],
a_Component$bindMouse$lambda$_22_4, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_4__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_4_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_4_handleEvent)],
jl_ClassCastException, 0, jl_RuntimeException, [], 1, 0, 0, 0,
juf_Supplier, 0, jl_Object, [], 1537, 0, 0, 0,
a_Component$bindMouse$lambda$_22_5, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_5__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_5_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_5_handleEvent)],
a_Component$bindMouse$lambda$_22_2, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_2__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_2_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_2_handleEvent)],
d_ImageTest, 0, jl_Object, [], 17, 0, 0, 0,
a_Component$bindMouse$lambda$_22_3, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_3__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_3_handleEvent0), "$handleEvent", $rt_wrapFunction1(a_Component$bindMouse$lambda$_22_3_handleEvent)],
c_Executors, 0, jl_Object, [], 17, 0, 0, 0,
c_ScheduledFuture, 0, jl_Object, [c_Future], 1, 0, 0, ["$_init_43", $rt_wrapFunction2(c_ScheduledFuture__init_), "$complete0", $rt_wrapFunction1(c_ScheduledFuture_complete), "$isDone", $rt_wrapFunction0(c_ScheduledFuture_isDone), "$isCancelled", $rt_wrapFunction0(c_ScheduledFuture_isCancelled), "$cancel", $rt_wrapFunction1(c_ScheduledFuture_cancel)],
s_SwingUtilities, 0, jl_Object, [], 17, 0, 0, 0,
s_SwingUtilities$invokeLater$lambda$_1_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_9", $rt_wrapFunction1(s_SwingUtilities$invokeLater$lambda$_1_0__init_), "$run", $rt_wrapFunction0(s_SwingUtilities$invokeLater$lambda$_1_0_run)],
ju_Iterator, 0, jl_Object, [], 1537, 0, 0, 0,
ju_AbstractList$1, 0, jl_Object, [ju_Iterator], 0, 0, 0, ["$_init_34", $rt_wrapFunction1(ju_AbstractList$1__init_), "$hasNext", $rt_wrapFunction0(ju_AbstractList$1_hasNext), "$next", $rt_wrapFunction0(ju_AbstractList$1_next)],
ai_BufferedImage, 0, jl_Object, [], 1, 0, 0, ["$_init_16", $rt_wrapFunction1(ai_BufferedImage__init_), "$getWidth", $rt_wrapFunction0(ai_BufferedImage_getWidth), "$getHeight", $rt_wrapFunction0(ai_BufferedImage_getHeight), "$element", $rt_wrapFunction0(ai_BufferedImage_element)],
a_Component$Callback, 0, jl_Object, [otj_JSObject], 1537, 0, 0, 0,
a_Component$frame$lambda$_16_0, 0, jl_Object, [a_Component$Callback], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$frame$lambda$_16_0__init_), "$call", $rt_wrapFunction0(a_Component$frame$lambda$_16_0_call)],
mr_Room, 0, jl_Object, [], 1, 0, 0, ["$_init_52", function(var_1, var_2, var_3, var_4, var_5, var_6) { mr_Room__init_(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$getRoomName", $rt_wrapFunction0(mr_Room_getRoomName), "$getOwnerUsername", $rt_wrapFunction0(mr_Room_getOwnerUsername), "$getCurrentPlayerCount", $rt_wrapFunction0(mr_Room_getCurrentPlayerCount), "$getMaxPlayers", $rt_wrapFunction0(mr_Room_getMaxPlayers)],
cr_RoomController, 0, jl_Object, [], 1, 0, 0, ["$_init_54", $rt_wrapFunction2(cr_RoomController__init_), "$getCurrentRoom", $rt_wrapFunction0(cr_RoomController_getCurrentRoom), "$isOwnerOfCurrentRoom", $rt_wrapFunction0(cr_RoomController_isOwnerOfCurrentRoom)],
jlr_Array, 0, jl_Object, [], 17, 0, 0, 0,
n_WebSocket$Listener, 0, jl_Object, [], 1537, 0, 0, 0,
d_InteractivePanel$_init_$lambda$_0_0, 0, jl_Object, [ae_MouseWheelListener], 1, 0, 0, ["$_init_51", $rt_wrapFunction1(d_InteractivePanel$_init_$lambda$_0_0__init_), "$mouseWheelMoved", $rt_wrapFunction1(d_InteractivePanel$_init_$lambda$_0_0_mouseWheelMoved)],
d_ImageTest$run$lambda$_3_0, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_19", $rt_wrapFunction1(d_ImageTest$run$lambda$_3_0__init_), "$run", $rt_wrapFunction0(d_ImageTest$run$lambda$_3_0_run)],
jn_URIEncoderDecoder, 0, jl_Object, [], 0, 0, 0, 0,
jn_URISyntaxException, 0, jl_Exception, [], 1, 0, 0, ["$_init_20", $rt_wrapFunction3(jn_URISyntaxException__init_1), "$_init_21", $rt_wrapFunction2(jn_URISyntaxException__init_2), "$getIndex", $rt_wrapFunction0(jn_URISyntaxException_getIndex), "$getMessage", $rt_wrapFunction0(jn_URISyntaxException_getMessage)],
vs_IconBase, 0, jl_Object, [], 17, 0, () => vs_IconBase_$callClinit(), 0,
otcit_DoubleAnalyzer$Result, 0, jl_Object, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(otcit_DoubleAnalyzer$Result__init_0)],
jn_URI$Helper, 0, jl_Object, [], 0, 0, 0, 0,
otpp_ResourceAccessor, 0, jl_Object, [], 16, 0, 0, 0,
jl_Iterable, 0, jl_Object, [], 1537, 0, 0, 0,
ju_Collection, 0, jl_Object, [jl_Iterable], 1537, 0, 0, 0,
ju_AbstractCollection, 0, jl_Object, [ju_Collection], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ju_AbstractCollection__init_), "$isEmpty", $rt_wrapFunction0(ju_AbstractCollection_isEmpty), "$contains1", $rt_wrapFunction1(ju_AbstractCollection_contains)],
d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$fixedRateRepeatsAndCancels$lambda$_8_0_run)],
jl_AutoCloseable, 0, jl_Object, [], 1537, 0, 0, 0]);
$rt_metadata([ji_Closeable, 0, jl_Object, [jl_AutoCloseable], 1537, 0, 0, 0,
ji_InputStream, 0, jl_Object, [ji_Closeable], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ji_InputStream__init_)],
ji_ByteArrayInputStream, 0, ji_InputStream, [], 1, 0, 0, ["$_init_22", $rt_wrapFunction3(ji_ByteArrayInputStream__init_), "$_init_18", $rt_wrapFunction1(ji_ByteArrayInputStream__init_0)],
otci_IntegerUtil, 0, jl_Object, [], 17, 0, 0, 0,
a_Component$bindResize$lambda$_24_0, 0, jl_Object, [a_Component$Callback], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindResize$lambda$_24_0__init_), "$call", $rt_wrapFunction0(a_Component$bindResize$lambda$_24_0_call)],
otji_JS, 0, jl_Object, [], 17, 0, 0, 0,
juf_Function, 0, jl_Object, [], 1537, 0, 0, 0,
c_CompletableFuture$thenRun$lambda$_11_0, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_9", $rt_wrapFunction1(c_CompletableFuture$thenRun$lambda$_11_0__init_), "$apply", $rt_wrapFunction1(c_CompletableFuture$thenRun$lambda$_11_0_apply0), "$apply0", $rt_wrapFunction1(c_CompletableFuture$thenRun$lambda$_11_0_apply)],
otciu_UnicodeHelper, 0, jl_Object, [], 17, 0, 0, 0,
a_Font, 0, jl_Object, [], 1, 0, 0, ["$_init_15", $rt_wrapFunction3(a_Font__init_0), "$toCss", $rt_wrapFunction0(a_Font_toCss)],
c_CompletableFuture$supplyAsync$lambda$_2_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_5", $rt_wrapFunction2(c_CompletableFuture$supplyAsync$lambda$_2_0__init_), "$run", $rt_wrapFunction0(c_CompletableFuture$supplyAsync$lambda$_2_0_run)],
ju_Objects, 0, jl_Object, [], 17, 0, 0, 0,
d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0, 0, jl_Object, [juc_Callable], 1, 0, 0, ["$_init_57", $rt_wrapFunction1(d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0__init_), "$call2", $rt_wrapFunction0(d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0_call0), "$call1", $rt_wrapFunction0(d_ConcurrencyTest$scheduleRespectsDelay$lambda$_7_0_call)],
ju_Map$Entry, 0, jl_Object, [], 1537, 0, 0, 0,
jl_Cloneable, 0, jl_Object, [], 1537, 0, 0, 0,
ju_MapEntry, 0, jl_Object, [ju_Map$Entry, jl_Cloneable], 0, 0, 0, ["$_init_25", $rt_wrapFunction2(ju_MapEntry__init_), "$equals", $rt_wrapFunction1(ju_MapEntry_equals)],
ju_HashMap$HashEntry, 0, ju_MapEntry, [], 0, 0, 0, ["$_init_61", $rt_wrapFunction2(ju_HashMap$HashEntry__init_)],
t_Duration, 0, jl_Object, [], 17, 0, () => t_Duration_$callClinit(), 0,
c_ScheduledExecutorService$schedule$lambda$_2_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_44", $rt_wrapFunction2(c_ScheduledExecutorService$schedule$lambda$_2_0__init_), "$run", $rt_wrapFunction0(c_ScheduledExecutorService$schedule$lambda$_2_0_run)],
ju_SequencedCollection, 0, jl_Object, [ju_Collection], 1537, 0, 0, 0,
ae_KeyEvent, 0, jl_Object, [], 1, 0, 0, ["$_init_49", function(var_1, var_2, var_3, var_4, var_5, var_6, var_7) { ae_KeyEvent__init_(this, var_1, var_2, var_3, var_4, var_5, var_6, var_7); }, "$getKeyCode", $rt_wrapFunction0(ae_KeyEvent_getKeyCode), "$getKeyChar", $rt_wrapFunction0(ae_KeyEvent_getKeyChar), "$isConsumed", $rt_wrapFunction0(ae_KeyEvent_isConsumed)],
c_ExecutorService$execute$lambda$_3_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_9", $rt_wrapFunction1(c_ExecutorService$execute$lambda$_3_0__init_), "$run", $rt_wrapFunction0(c_ExecutorService$execute$lambda$_3_0_run)],
a_Shape, 0, jl_Object, [], 1537, 0, 0, 0,
ag_Area, 0, jl_Object, [a_Shape], 1, 0, 0, ["$_init_40", $rt_wrapFunction1(ag_Area__init_0), "$add0", $rt_wrapFunction1(ag_Area_add), "$emit", $rt_wrapFunction1(ag_Area_emit)],
n_WebSocket, 0, jl_Object, [], 1537, 0, 0, 0,
n_BrowserWebSocket, 0, jl_Object, [n_WebSocket], 0, 0, 0, ["$_init_60", $rt_wrapFunction3(n_BrowserWebSocket__init_), "$sendText", $rt_wrapFunction2(n_BrowserWebSocket_sendText), "$sendClose", $rt_wrapFunction2(n_BrowserWebSocket_sendClose), "$request", $rt_wrapFunction1(n_BrowserWebSocket_request), "$isInputClosed", $rt_wrapFunction0(n_BrowserWebSocket_isInputClosed), "$isOutputClosed", $rt_wrapFunction0(n_BrowserWebSocket_isOutputClosed)],
otji_JSWrapper, 0, jl_Object, [], 17, 0, 0, 0,
otp_Platform, 0, jl_Object, [], 17, 0, 0, 0,
ag_RoundRectangle2D, 0, jl_Object, [a_Shape], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ag_RoundRectangle2D__init_), "$trace", $rt_wrapFunction1(ag_RoundRectangle2D_trace), "$emit", $rt_wrapFunction1(ag_RoundRectangle2D_emit)],
jl_Boolean, 0, jl_Object, [ji_Serializable, jl_Comparable], 1, 0, () => jl_Boolean_$callClinit(), ["$_init_29", $rt_wrapFunction1(jl_Boolean__init_0)],
d_WebSocketTest, 0, jl_Object, [], 17, 0, () => d_WebSocketTest_$callClinit(), 0,
juf_Consumer, 0, jl_Object, [], 1537, 0, 0, 0,
vs_GroupIcon$draw$lambda$_1_0, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_", $rt_wrapFunction0(vs_GroupIcon$draw$lambda$_1_0__init_), "$accept0", $rt_wrapFunction1(vs_GroupIcon$draw$lambda$_1_0_accept0), "$accept1", $rt_wrapFunction1(vs_GroupIcon$draw$lambda$_1_0_accept)],
jlr_AnnotatedElement, 0, jl_Object, [], 1537, 0, 0, 0,
jlr_GenericDeclaration, 0, jl_Object, [jlr_AnnotatedElement], 1537, 0, 0, 0,
vs_Theme, 0, jl_Object, [], 17, 0, () => vs_Theme_$callClinit(), 0,
juf_BiConsumer, 0, jl_Object, [], 1537, 0, 0, 0,
d_ConcurrencyTest$completableChain$lambda$_9_2, 0, jl_Object, [juf_BiConsumer], 1, 0, 0, ["$_init_59", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_2__init_), "$accept", $rt_wrapFunction2(d_ConcurrencyTest$completableChain$lambda$_9_2_accept0), "$accept2", $rt_wrapFunction2(d_ConcurrencyTest$completableChain$lambda$_9_2_accept)],
d_ConcurrencyTest$completableChain$lambda$_9_1, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_58", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_1__init_), "$accept0", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_1_accept0), "$accept3", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_1_accept)],
d_ConcurrencyTest$completableChain$lambda$_9_0, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$completableChain$lambda$_9_0__init_), "$apply", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_0_apply0), "$apply1", $rt_wrapFunction1(d_ConcurrencyTest$completableChain$lambda$_9_0_apply)],
n_WebSocket$Builder, 0, jl_Object, [], 1537, 0, 0, 0,
ju_AbstractMap, 0, jl_Object, [ju_Map], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ju_AbstractMap__init_)],
c_ScheduledExecutorService$schedule$lambda$_1_0, 0, jl_Object, [c_EventLoop$Task], 1, 0, 0, ["$_init_42", $rt_wrapFunction2(c_ScheduledExecutorService$schedule$lambda$_1_0__init_), "$run", $rt_wrapFunction0(c_ScheduledExecutorService$schedule$lambda$_1_0_run)],
c_CompletableFuture$thenApply$lambda$_9_0, 0, jl_Object, [juf_BiConsumer], 1, 0, 0, ["$_init_7", $rt_wrapFunction2(c_CompletableFuture$thenApply$lambda$_9_0__init_), "$accept", $rt_wrapFunction2(c_CompletableFuture$thenApply$lambda$_9_0_accept0), "$accept4", $rt_wrapFunction2(c_CompletableFuture$thenApply$lambda$_9_0_accept)],
jlr_Type, 0, jl_Object, [], 1537, 0, 0, 0,
jl_Class, 0, jl_Object, [jlr_GenericDeclaration, jlr_Type], 17, 0, 0, ["$getClassInfo", $rt_wrapFunction0(jl_Class_getClassInfo), "$getName", $rt_wrapFunction0(jl_Class_getName), "$getComponentType", $rt_wrapFunction0(jl_Class_getComponentType)],
n_HttpClient, 0, jl_Object, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(n_HttpClient__init_), "$newWebSocketBuilder", $rt_wrapFunction0(n_HttpClient_newWebSocketBuilder)],
ag_Ellipse2D, 0, jl_Object, [a_Shape], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ag_Ellipse2D__init_), "$emit", $rt_wrapFunction1(ag_Ellipse2D_emit)],
ag_Ellipse2D$Double, 0, ag_Ellipse2D, [], 1, 0, 0, ["$_init_38", $rt_wrapFunction4(ag_Ellipse2D$Double__init_), "$x", $rt_wrapFunction0(ag_Ellipse2D$Double_x), "$y", $rt_wrapFunction0(ag_Ellipse2D$Double_y), "$w", $rt_wrapFunction0(ag_Ellipse2D$Double_w), "$h", $rt_wrapFunction0(ag_Ellipse2D$Double_h)],
ju_Arrays, 0, jl_Object, [], 1, 0, 0, 0]);
$rt_metadata([a_Composite, 0, jl_Object, [], 1537, 0, 0, 0,
a_AlphaComposite, 0, jl_Object, [a_Composite], 1, 0, 0, ["$getAlpha", $rt_wrapFunction0(a_AlphaComposite_getAlpha)],
a_Component$bindKeyboard$lambda$_23_2, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_2__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_2_handleEvent)],
a_Component$bindKeyboard$lambda$_23_1, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_1__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_1_handleEvent0), "$handleEvent2", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_1_handleEvent)],
a_Component$bindKeyboard$lambda$_23_0, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_0__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_0_handleEvent0), "$handleEvent2", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_0_handleEvent)],
ae_FocusEvent, 0, jl_Object, [], 1, 0, 0, ["$_init_35", $rt_wrapFunction1(ae_FocusEvent__init_)],
c_CompletableFuture$exceptionally$lambda$_13_0, 0, jl_Object, [juf_BiConsumer], 1, 0, 0, ["$_init_7", $rt_wrapFunction2(c_CompletableFuture$exceptionally$lambda$_13_0__init_), "$accept", $rt_wrapFunction2(c_CompletableFuture$exceptionally$lambda$_13_0_accept0), "$accept4", $rt_wrapFunction2(c_CompletableFuture$exceptionally$lambda$_13_0_accept)],
jl_Character, 0, jl_Object, [jl_Comparable], 1, 0, () => jl_Character_$callClinit(), 0,
otrr_ReflectionInfo, 0, jl_Object, [], 1025, 0, 0, 0,
c_CompletableFuture$thenAccept$lambda$_10_0, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_8", $rt_wrapFunction1(c_CompletableFuture$thenAccept$lambda$_10_0__init_), "$apply", $rt_wrapFunction1(c_CompletableFuture$thenAccept$lambda$_10_0_apply0), "$apply0", $rt_wrapFunction1(c_CompletableFuture$thenAccept$lambda$_10_0_apply)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_12_run)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_11_run)],
jl_Enum, 0, jl_Object, [jl_Comparable, ji_Serializable], 1025, 0, 0, ["$_init_32", $rt_wrapFunction2(jl_Enum__init_)],
mr_Room$RoomType, 0, jl_Enum, [], 65553, 0, () => mr_Room$RoomType_$callClinit(), 0,
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_10_run)],
a_Component$bindKeyboard$lambda$_23_3, 0, jl_Object, [otjde_EventListener], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_3__init_), "$handleEvent0", $rt_wrapFunction1(a_Component$bindKeyboard$lambda$_23_3_handleEvent)],
ae_ComponentEvent, 0, jl_Object, [], 1, 0, 0, ["$_init_35", $rt_wrapFunction1(ae_ComponentEvent__init_)],
c_CompletedFuture, 0, jl_Object, [c_Future], 1, 0, 0, ["$_init_35", $rt_wrapFunction1(c_CompletedFuture__init_), "$_init_41", $rt_wrapFunction1(c_CompletedFuture__init_0), "$get", $rt_wrapFunction0(c_CompletedFuture_get), "$isDone", $rt_wrapFunction0(c_CompletedFuture_isDone)],
ae_MouseEvent, 0, jl_Object, [], 1, 0, 0, ["$_init_33", function(var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8, var_9) { ae_MouseEvent__init_(this, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8, var_9); }, "$getX", $rt_wrapFunction0(ae_MouseEvent_getX), "$getY", $rt_wrapFunction0(ae_MouseEvent_getY)],
ae_MouseWheelEvent, 0, ae_MouseEvent, [], 1, 0, 0, ["$_init_50", function(var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8, var_9) { ae_MouseWheelEvent__init_(this, var_1, var_2, var_3, var_4, var_5, var_6, var_7, var_8, var_9); }, "$getWheelRotation", $rt_wrapFunction0(ae_MouseWheelEvent_getWheelRotation)],
jl_Double, 0, jl_Number, [jl_Comparable], 1, 0, () => jl_Double_$callClinit(), 0,
ju_List, 0, jl_Object, [ju_SequencedCollection], 1537, 0, 0, 0,
ju_AbstractList, 0, ju_AbstractCollection, [ju_List], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(ju_AbstractList__init_), "$iterator", $rt_wrapFunction0(ju_AbstractList_iterator)],
ju_RandomAccess, 0, jl_Object, [], 1537, 0, 0, 0,
ju_ArrayList, 0, ju_AbstractList, [jl_Cloneable, ji_Serializable, ju_RandomAccess], 1, 0, 0, ["$_init_", $rt_wrapFunction0(ju_ArrayList__init_1), "$_init_3", $rt_wrapFunction1(ju_ArrayList__init_0), "$ensureCapacity", $rt_wrapFunction1(ju_ArrayList_ensureCapacity), "$get1", $rt_wrapFunction1(ju_ArrayList_get), "$size", $rt_wrapFunction0(ju_ArrayList_size), "$add", $rt_wrapFunction1(ju_ArrayList_add), "$clear", $rt_wrapFunction0(ju_ArrayList_clear)],
jl_String, 0, jl_Object, [ji_Serializable, jl_Comparable, jl_CharSequence], 17, 0, () => jl_String_$callClinit(), ["$_init_", $rt_wrapFunction0(jl_String__init_1), "$_init_23", $rt_wrapFunction1(jl_String__init_), "$_init_35", $rt_wrapFunction1(jl_String__init_2), "$_init_11", $rt_wrapFunction3(jl_String__init_4), "$charAt", $rt_wrapFunction1(jl_String_charAt), "$length", $rt_wrapFunction0(jl_String_length), "$isEmpty", $rt_wrapFunction0(jl_String_isEmpty), "$startsWith0", $rt_wrapFunction2(jl_String_startsWith0),
"$startsWith", $rt_wrapFunction1(jl_String_startsWith), "$indexOf0", $rt_wrapFunction2(jl_String_indexOf0), "$indexOf", $rt_wrapFunction1(jl_String_indexOf), "$lastIndexOf0", $rt_wrapFunction2(jl_String_lastIndexOf0), "$lastIndexOf", $rt_wrapFunction1(jl_String_lastIndexOf), "$substring0", $rt_wrapFunction2(jl_String_substring), "$substring", $rt_wrapFunction1(jl_String_substring0), "$subSequence", $rt_wrapFunction2(jl_String_subSequence), "$concat", $rt_wrapFunction1(jl_String_concat), "$contains0", $rt_wrapFunction1(jl_String_contains),
"$toString", $rt_wrapFunction0(jl_String_toString), "$toCharArray", $rt_wrapFunction0(jl_String_toCharArray), "$equals", $rt_wrapFunction1(jl_String_equals), "$hashCode", $rt_wrapFunction0(jl_String_hashCode), "$toUpperCase", $rt_wrapFunction0(jl_String_toUpperCase)],
a_BasicStroke, 0, jl_Object, [a_Stroke], 1, 0, 0, ["$_init_13", $rt_wrapFunction1(a_BasicStroke__init_2), "$_init_36", $rt_wrapFunction3(a_BasicStroke__init_0), "$getLineWidth", $rt_wrapFunction0(a_BasicStroke_getLineWidth), "$capCss", $rt_wrapFunction0(a_BasicStroke_capCss), "$joinCss", $rt_wrapFunction0(a_BasicStroke_joinCss)],
ag_RoundRectangle2D$Float, 0, ag_RoundRectangle2D, [], 1, 0, 0, ["$_init_14", function(var_1, var_2, var_3, var_4, var_5, var_6) { ag_RoundRectangle2D$Float__init_(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$x", $rt_wrapFunction0(ag_RoundRectangle2D$Float_x), "$y", $rt_wrapFunction0(ag_RoundRectangle2D$Float_y), "$w", $rt_wrapFunction0(ag_RoundRectangle2D$Float_w), "$h", $rt_wrapFunction0(ag_RoundRectangle2D$Float_h), "$arcW", $rt_wrapFunction0(ag_RoundRectangle2D$Float_arcW), "$arcH", $rt_wrapFunction0(ag_RoundRectangle2D$Float_arcH)],
jl_NegativeArraySizeException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_NegativeArraySizeException__init_)],
a_RenderingHints, 0, jl_Object, [], 1, 0, () => a_RenderingHints_$callClinit(), 0,
jl_UnsupportedOperationException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_0", $rt_wrapFunction1(jl_UnsupportedOperationException__init_)],
d_WebSocketTest$run$lambda$_3_0, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_WebSocketTest$run$lambda$_3_0__init_), "$accept0", $rt_wrapFunction1(d_WebSocketTest$run$lambda$_3_0_accept0), "$accept5", $rt_wrapFunction1(d_WebSocketTest$run$lambda$_3_0_accept)],
a_GradientPaint, 0, jl_Object, [a_Paint], 1, 0, 0, ["$_init_37", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_GradientPaint__init_0(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$_init_12", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_GradientPaint__init_(this, var_1, var_2, var_3, var_4, var_5, var_6); }],
jl_IllegalArgumentException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_IllegalArgumentException__init_1), "$_init_0", $rt_wrapFunction1(jl_IllegalArgumentException__init_2)],
jl_NumberFormatException, 0, jl_IllegalArgumentException, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(jl_NumberFormatException__init_1), "$_init_0", $rt_wrapFunction1(jl_NumberFormatException__init_)],
a_Component$start$lambda$_15_0, 0, jl_Object, [a_Component$Callback], 1, 0, 0, ["$_init_48", $rt_wrapFunction1(a_Component$start$lambda$_15_0__init_), "$call", $rt_wrapFunction0(a_Component$start$lambda$_15_0_call)],
vs_GroupIcon, 0, jl_Object, [], 17, 0, 0, 0,
jl_IllegalStateException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_0", $rt_wrapFunction1(jl_IllegalStateException__init_0)],
jl_NullPointerException, 0, jl_RuntimeException, [], 1, 0, 0, ["$_init_0", $rt_wrapFunction1(jl_NullPointerException__init_1), "$_init_", $rt_wrapFunction0(jl_NullPointerException__init_0)],
ag_PathSink$Recording, 0, jl_Object, [ag_PathSink], 17, 0, 0, ["$_init_", $rt_wrapFunction0(ag_PathSink$Recording__init_), "$moveTo", $rt_wrapFunction2(ag_PathSink$Recording_moveTo), "$lineTo", $rt_wrapFunction2(ag_PathSink$Recording_lineTo), "$quadTo", $rt_wrapFunction4(ag_PathSink$Recording_quadTo), "$curveTo", function(var_1, var_2, var_3, var_4, var_5, var_6) { ag_PathSink$Recording_curveTo(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$closePath", $rt_wrapFunction0(ag_PathSink$Recording_closePath),
"$replay", $rt_wrapFunction1(ag_PathSink$Recording_replay)],
a_Graphics, 0, jl_Object, [], 1025, 0, 0, ["$_init_", $rt_wrapFunction0(a_Graphics__init_)],
c_ExecutorService, 0, jl_Object, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(c_ExecutorService__init_), "$submit", $rt_wrapFunction1(c_ExecutorService_submit), "$execute", $rt_wrapFunction1(c_ExecutorService_execute), "$shutdown", $rt_wrapFunction0(c_ExecutorService_shutdown), "$isShutdown", $rt_wrapFunction0(c_ExecutorService_isShutdown)],
c_ScheduledExecutorService, 0, c_ExecutorService, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(c_ScheduledExecutorService__init_), "$schedule", $rt_wrapFunction3(c_ScheduledExecutorService_schedule0), "$schedule0", $rt_wrapFunction3(c_ScheduledExecutorService_schedule), "$scheduleAtFixedRate", $rt_wrapFunction4(c_ScheduledExecutorService_scheduleAtFixedRate)],
jl_Math, 0, jl_Object, [], 17, 0, 0, 0,
jn_URI, 0, jl_Object, [jl_Comparable, ji_Serializable], 17, 0, 0, ["$_init_0", $rt_wrapFunction1(jn_URI__init_), "$toString", $rt_wrapFunction0(jn_URI_toString)],
a_Component, 0, jl_Object, [], 1, 0, () => a_Component_$callClinit(), ["$_init_", $rt_wrapFunction0(a_Component__init_), "$attach", $rt_wrapFunction1(a_Component_attach), "$getWidth", $rt_wrapFunction0(a_Component_getWidth), "$getHeight", $rt_wrapFunction0(a_Component_getHeight), "$addMouseListener", $rt_wrapFunction1(a_Component_addMouseListener), "$addMouseMotionListener", $rt_wrapFunction1(a_Component_addMouseMotionListener), "$addMouseWheelListener", $rt_wrapFunction1(a_Component_addMouseWheelListener),
"$addKeyListener", $rt_wrapFunction1(a_Component_addKeyListener), "$repaint", $rt_wrapFunction0(a_Component_repaint), "$start", $rt_wrapFunction0(a_Component_start)],
d_InteractivePanel, 0, a_Component, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_InteractivePanel__init_), "$paint1", $rt_wrapFunction1(d_InteractivePanel_paint)],
c_CompletableFuture$whenComplete$lambda$_8_0, 0, jl_Object, [juf_BiConsumer], 1, 0, 0, ["$_init_6", $rt_wrapFunction2(c_CompletableFuture$whenComplete$lambda$_8_0__init_), "$accept", $rt_wrapFunction2(c_CompletableFuture$whenComplete$lambda$_8_0_accept0), "$accept4", $rt_wrapFunction2(c_CompletableFuture$whenComplete$lambda$_8_0_accept)],
ag_RoundRectangle2D$Double, 0, ag_RoundRectangle2D, [], 1, 0, 0, ["$_init_39", function(var_1, var_2, var_3, var_4, var_5, var_6) { ag_RoundRectangle2D$Double__init_(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$x", $rt_wrapFunction0(ag_RoundRectangle2D$Double_x), "$y", $rt_wrapFunction0(ag_RoundRectangle2D$Double_y), "$w", $rt_wrapFunction0(ag_RoundRectangle2D$Double_w), "$h", $rt_wrapFunction0(ag_RoundRectangle2D$Double_h), "$arcW", $rt_wrapFunction0(ag_RoundRectangle2D$Double_arcW), "$arcH", $rt_wrapFunction0(ag_RoundRectangle2D$Double_arcH)],
d_ConcurrencyTest, 0, jl_Object, [], 17, 0, 0, 0]);
$rt_metadata([d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_2_run)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_55", $rt_wrapFunction2(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_3_run)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_0_run)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_1_run)],
d_Main, 0, jl_Object, [], 17, 0, () => d_Main_$callClinit(), 0,
m_GamePanel, 0, jl_Object, [], 1, 0, 0, ["$_init_3", $rt_wrapFunction1(m_GamePanel__init_), "$getHeight", $rt_wrapFunction0(m_GamePanel_getHeight)],
n_BrowserWebSocket$BuilderImpl, 0, jl_Object, [n_WebSocket$Builder], 0, 0, 0, ["$_init_", $rt_wrapFunction0(n_BrowserWebSocket$BuilderImpl__init_), "$header", $rt_wrapFunction2(n_BrowserWebSocket$BuilderImpl_header), "$connectTimeout", $rt_wrapFunction1(n_BrowserWebSocket$BuilderImpl_connectTimeout), "$buildAsync", $rt_wrapFunction2(n_BrowserWebSocket$BuilderImpl_buildAsync)],
ju_HashMap, 0, ju_AbstractMap, [jl_Cloneable, ji_Serializable], 1, 0, 0, ["$newElementArray", $rt_wrapFunction1(ju_HashMap_newElementArray), "$_init_", $rt_wrapFunction0(ju_HashMap__init_1), "$_init_3", $rt_wrapFunction1(ju_HashMap__init_), "$_init_31", $rt_wrapFunction2(ju_HashMap__init_0), "$clear", $rt_wrapFunction0(ju_HashMap_clear), "$get0", $rt_wrapFunction1(ju_HashMap_get), "$entryByKey", $rt_wrapFunction1(ju_HashMap_entryByKey), "$findNonNullKeyEntry", $rt_wrapFunction3(ju_HashMap_findNonNullKeyEntry),
"$findNullKeyEntry", $rt_wrapFunction0(ju_HashMap_findNullKeyEntry), "$put", $rt_wrapFunction2(ju_HashMap_put), "$rehash0", $rt_wrapFunction1(ju_HashMap_rehash0), "$rehash", $rt_wrapFunction0(ju_HashMap_rehash)],
otciu_UnicodeHelper$Range, 0, jl_Object, [], 1, 0, 0, ["$_init_24", $rt_wrapFunction3(otciu_UnicodeHelper$Range__init_)],
otcit_DoubleAnalyzer, 0, jl_Object, [], 17, 0, () => otcit_DoubleAnalyzer_$callClinit(), 0,
otr_StringInfo, 0, otrr_ReflectionInfo, [], 17, 0, 0, 0,
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6__init_), "$accept0", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6_accept0), "$accept3", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_6_accept)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7, 0, jl_Object, [juf_Supplier], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7__init_), "$get", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7_get0), "$get2", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_7_get)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4, 0, jl_Object, [juf_Supplier], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4__init_), "$get", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4_get0), "$get3", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_4_get)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5__init_), "$apply", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5_apply0), "$apply1", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_5_apply)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8__init_), "$apply", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8_apply0), "$apply2", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_8_apply)],
d_WebSocketTest$Listener, 0, jl_Object, [n_WebSocket$Listener], 0, 0, 0, ["$_init_", $rt_wrapFunction0(d_WebSocketTest$Listener__init_), "$onOpen", $rt_wrapFunction1(d_WebSocketTest$Listener_onOpen), "$onText", $rt_wrapFunction3(d_WebSocketTest$Listener_onText), "$onClose", $rt_wrapFunction3(d_WebSocketTest$Listener_onClose), "$onError", $rt_wrapFunction2(d_WebSocketTest$Listener_onError)],
d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9__init_), "$accept0", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9_accept0), "$accept6", $rt_wrapFunction1(d_ConcurrencyTest$deferredWorkActuallyRuns$lambda$_4_9_accept)],
otci_CharFlow, 0, jl_Object, [], 1, 0, 0, ["$_init_23", $rt_wrapFunction1(otci_CharFlow__init_)],
d_ConcurrencyTest$executeIsDeferred$lambda$_6_0, 0, jl_Object, [jl_Runnable], 1, 0, 0, ["$_init_56", $rt_wrapFunction1(d_ConcurrencyTest$executeIsDeferred$lambda$_6_0__init_), "$run", $rt_wrapFunction0(d_ConcurrencyTest$executeIsDeferred$lambda$_6_0_run)],
c_EventLoop, 0, jl_Object, [], 17, 0, 0, 0,
d_ConcurrencyTest$completableFailure$lambda$_10_0, 0, jl_Object, [juf_Function], 1, 0, 0, ["$_init_", $rt_wrapFunction0(d_ConcurrencyTest$completableFailure$lambda$_10_0__init_), "$apply", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_0_apply0), "$apply2", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_0_apply)],
d_ConcurrencyTest$completableFailure$lambda$_10_1, 0, jl_Object, [juf_Consumer], 1, 0, 0, ["$_init_59", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_1__init_), "$accept0", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_1_accept0), "$accept6", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_1_accept)],
d_ConcurrencyTest$completableFailure$lambda$_10_2, 0, jl_Object, [juf_BiConsumer], 1, 0, 0, ["$_init_57", $rt_wrapFunction1(d_ConcurrencyTest$completableFailure$lambda$_10_2__init_), "$accept", $rt_wrapFunction2(d_ConcurrencyTest$completableFailure$lambda$_10_2_accept0), "$accept2", $rt_wrapFunction2(d_ConcurrencyTest$completableFailure$lambda$_10_2_accept)],
a_FontMetrics, 0, jl_Object, [], 1, 0, 0, ["$_init_64", $rt_wrapFunction2(a_FontMetrics__init_), "$stringWidth", $rt_wrapFunction1(a_FontMetrics_stringWidth), "$charWidth", $rt_wrapFunction1(a_FontMetrics_charWidth)],
juc_TimeUnit, 0, jl_Enum, [], 65553, 0, () => juc_TimeUnit_$callClinit(), ["$convert", $rt_wrapFunction2(juc_TimeUnit_convert), "$toMillis", $rt_wrapFunction1(juc_TimeUnit_toMillis)],
otcit_FloatAnalyzer$Result, 0, jl_Object, [], 1, 0, 0, ["$_init_", $rt_wrapFunction0(otcit_FloatAnalyzer$Result__init_)],
otrr_ClassInfo, 0, otrr_ReflectionInfo, [], 17, 0, 0, ["$newArrayInstance", $rt_wrapFunction1(otrr_ClassInfo_newArrayInstance)],
ae_ComponentListener, 0, jl_Object, [], 1537, 0, 0, 0,
a_Graphics2D, 0, a_Graphics, [], 1, 0, 0, ["$_init_47", $rt_wrapFunction1(a_Graphics2D__init_), "$setColor", $rt_wrapFunction1(a_Graphics2D_setColor), "$setPaint", $rt_wrapFunction1(a_Graphics2D_setPaint), "$setStroke", $rt_wrapFunction1(a_Graphics2D_setStroke), "$setComposite", $rt_wrapFunction1(a_Graphics2D_setComposite), "$getComposite", $rt_wrapFunction0(a_Graphics2D_getComposite), "$setFont", $rt_wrapFunction1(a_Graphics2D_setFont), "$getFont", $rt_wrapFunction0(a_Graphics2D_getFont), "$getFontMetrics",
$rt_wrapFunction0(a_Graphics2D_getFontMetrics), "$measureTextWidth", $rt_wrapFunction1(a_Graphics2D_measureTextWidth), "$drawString", $rt_wrapFunction3(a_Graphics2D_drawString), "$fillRect", $rt_wrapFunction4(a_Graphics2D_fillRect), "$fillRoundRect", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_Graphics2D_fillRoundRect(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$drawRoundRect", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_Graphics2D_drawRoundRect(this, var_1, var_2, var_3, var_4,
var_5, var_6); }, "$roundRectPath", function(var_1, var_2, var_3, var_4, var_5, var_6) { a_Graphics2D_roundRectPath(this, var_1, var_2, var_3, var_4, var_5, var_6); }, "$fillOval", $rt_wrapFunction4(a_Graphics2D_fillOval), "$drawOval", $rt_wrapFunction4(a_Graphics2D_drawOval), "$drawLine", $rt_wrapFunction4(a_Graphics2D_drawLine), "$fillPolygon", $rt_wrapFunction3(a_Graphics2D_fillPolygon), "$clip", $rt_wrapFunction1(a_Graphics2D_clip), "$getClip", $rt_wrapFunction0(a_Graphics2D_getClip), "$setClip", $rt_wrapFunction1(a_Graphics2D_setClip),
"$translate", $rt_wrapFunction2(a_Graphics2D_translate), "$scale", $rt_wrapFunction2(a_Graphics2D_scale), "$setRenderingHint", $rt_wrapFunction2(a_Graphics2D_setRenderingHint), "$create", $rt_wrapFunction0(a_Graphics2D_create), "$dispose", $rt_wrapFunction0(a_Graphics2D_dispose), "$sink", $rt_wrapFunction0(a_Graphics2D_sink), "$fill1", $rt_wrapFunction1(a_Graphics2D_fill), "$draw", $rt_wrapFunction1(a_Graphics2D_draw)]]);
let $rt_booleanArrayCls = $rt_arraycls($rt_booleancls),
$rt_charArrayCls = $rt_arraycls($rt_charcls),
$rt_byteArrayCls = $rt_arraycls($rt_bytecls),
$rt_shortArrayCls = $rt_arraycls($rt_shortcls),
$rt_intArrayCls = $rt_arraycls($rt_intcls),
$rt_longArrayCls = $rt_arraycls($rt_longcls),
$rt_doubleArrayCls = $rt_arraycls($rt_doublecls);
$rt_stringPool(["String is null", "String is empty", "String contains invalid digits: ", "String contains digits out of radix ", ": ", "The value is too big for int type: ", "The value is too big for integer type", "Illegal radix: ", "gear clicked - handleClick returned true  (", "click at ", " - not the gear", "rgb(", "rgba(", "space - card visible=", "key \'", "\'  code=", "join() on an incomplete CompletableFuture cannot block in a browser; use thenAccept/whenComplete instead", "null", "false", "true", "gp must not be null",
"controller must not be null", "SansSerif", "FUTURA", " / ", "", "…", "ImageIO.read(InputStream) cannot work in a browser: there is no classpath and no synchronous file read. Use ImageIO.read(String url) with the asset served over HTTP, and ImageIO.setResourceBase(...) to keep existing paths.", "http://", "https://", "data:", "/", "FAIL ", "PASS ", "assets", "/res/tile/wall.png", "read() returns immediately", "dimensions are 0 while decoding", "isLoaded false while decoding", "repeat read shares one image",
"https://cdn.test/sprite.png", "absolute URLs bypass the resource base", "read(String url)", "read(InputStream) fails loudly with a fix in the message", "/res/tile/floor.png", "/res/icons/chat.png", "preload resolves even when an image fails", "dimensions become correct after load", "isLoaded true after load", "//", "+-.", "_-!.~\'()*,;:$&+=?/[]@", "@[]_-!.~\'()*,;:$&+=", "/@_-!.~\'()*,;:$&+=", "_-!.~\'()*,;:$&+=?/[]@\\\"", "-.", "0", "italic ", "bold ", "px ", "sans-serif", "Serif", "serif", "Monospaced", "monospace",
"Dialog", "websocket error", "X-Game-Version", "1.4.2", "wss://example.test/socket", "buildAsync returns a future", "future is not complete before the socket opens", "future completes when the socket opens", "hello", "isInputClosed false while open", "bye", "isOutputClosed true after sendClose", "[L", "PUBLIC", "PRIVATE", "round", "butt", "square", "miter", "bevel", "antialiasing", "on", "off", "strokeControl", "pure", "rendering", "quality", "textAntialiasing", "interpolation", "bilinear", "executor is shut down",
"Enter", "Tab", "Backspace", "move the mouse over the gear", "room-42", "Futura Lounge — Rooftop", "AnkillousDev", ", ", "wheel: icon ", "px", "submit(Callable) completes and get() works", "shutdown() flags the executor", "caller", "execute() defers past the caller", "schedule() does not run immediately", "schedule() returns a live handle", "scheduled task can be cancelled", "fixed-rate task cancels cleanly", "thenApply/thenAccept chain runs", "x", "whenComplete sees value and null error", "x:true", "boom",
"completeExceptionally marks failure", "exceptionally substitutes a value", "recovered", "whenComplete sees the error", "join() on incomplete future throws rather than blocking", "now", "invokeLater defers past the caller", "isEventDispatchThread is always true", "invokeAndWait runs inline", "wait", "later", "task", "invokeLater preserves FIFO order", "supplyAsync failure reaches exceptionally", "handled", "nope", "supplyAsync resolves through the chain", "scheduleAtFixedRate repeats", "schedule() fires after its delay",
"invokeLater() eventually runs the task", "execute() eventually runs the task", "open", "text:", "onText delivers a whole message with last=true", "close:", "error", "NANOSECONDS", "MICROSECONDS", "MILLISECONDS", "SECONDS", "MINUTES", "HOURS", "DAYS"]);
jl_String.prototype.toString = function() {
    return $rt_ustr(this);
};
jl_String.prototype.valueOf = jl_String.prototype.toString;
jl_Object.prototype.toString = function() {
    return $rt_ustr(jl_Object_toString(this));
};
jl_Object.prototype.__teavm_class__ = function() {
    return $dbg_class(this);
};
let $rt_export_main = $rt_mainStarter(d_Main_main);
$rt_export_main.javaException = $rt_javaException;
let $rt_jso_marker = Symbol('jsoClass');
(() => {
    let c;
    c = c_ScheduledExecutorService$repeating$lambda$_5_1.prototype;
    c.run = $rt_callWithReceiver(c_ScheduledExecutorService$repeating$lambda$_5_1_run$exported$0);
    c = i_ImageIO$preload$lambda$_5_0.prototype;
    c.call = $rt_callWithReceiver(i_ImageIO$preload$lambda$_5_0_call$exported$0);
    c = n_BrowserWebSocket$_init_$lambda$_0_1.prototype;
    c.handle = $rt_callWithReceiver(n_BrowserWebSocket$_init_$lambda$_0_1_handle$exported$0);
    c = n_BrowserWebSocket$_init_$lambda$_0_2.prototype;
    c.handle = $rt_callWithReceiver(n_BrowserWebSocket$_init_$lambda$_0_2_handle$exported$0);
    c = n_BrowserWebSocket$_init_$lambda$_0_0.prototype;
    c.handle = $rt_callWithReceiver(n_BrowserWebSocket$_init_$lambda$_0_0_handle$exported$0);
    c = n_BrowserWebSocket$_init_$lambda$_0_3.prototype;
    c.handle = $rt_callWithReceiver(n_BrowserWebSocket$_init_$lambda$_0_3_handle$exported$0);
    c = c_ScheduledExecutorService$repeating$lambda$_5_0.prototype;
    c.run = $rt_callWithReceiver(c_ScheduledExecutorService$repeating$lambda$_5_0_run$exported$0);
    c = c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0.prototype;
    c.run = $rt_callWithReceiver(c_ScheduledExecutorService$lambda$repeating$2$lambda$_7_0_run$exported$0);
    c = a_Component$bindMouse$lambda$_22_0.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_0_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_1.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_1_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_6.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_6_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_7.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_7_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_4.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_4_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_5.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_5_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_2.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_2_handleEvent$exported$0);
    c = a_Component$bindMouse$lambda$_22_3.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindMouse$lambda$_22_3_handleEvent$exported$0);
    c = s_SwingUtilities$invokeLater$lambda$_1_0.prototype;
    c.run = $rt_callWithReceiver(s_SwingUtilities$invokeLater$lambda$_1_0_run$exported$0);
    c = a_Component$frame$lambda$_16_0.prototype;
    c.call = $rt_callWithReceiver(a_Component$frame$lambda$_16_0_call$exported$0);
    c = a_Component$bindResize$lambda$_24_0.prototype;
    c.call = $rt_callWithReceiver(a_Component$bindResize$lambda$_24_0_call$exported$0);
    c = c_CompletableFuture$supplyAsync$lambda$_2_0.prototype;
    c.run = $rt_callWithReceiver(c_CompletableFuture$supplyAsync$lambda$_2_0_run$exported$0);
    c = c_ScheduledExecutorService$schedule$lambda$_2_0.prototype;
    c.run = $rt_callWithReceiver(c_ScheduledExecutorService$schedule$lambda$_2_0_run$exported$0);
    c = c_ExecutorService$execute$lambda$_3_0.prototype;
    c.run = $rt_callWithReceiver(c_ExecutorService$execute$lambda$_3_0_run$exported$0);
    c = c_ScheduledExecutorService$schedule$lambda$_1_0.prototype;
    c.run = $rt_callWithReceiver(c_ScheduledExecutorService$schedule$lambda$_1_0_run$exported$0);
    c = a_Component$bindKeyboard$lambda$_23_2.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindKeyboard$lambda$_23_2_handleEvent$exported$0);
    c = a_Component$bindKeyboard$lambda$_23_1.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindKeyboard$lambda$_23_1_handleEvent$exported$0);
    c = a_Component$bindKeyboard$lambda$_23_0.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindKeyboard$lambda$_23_0_handleEvent$exported$0);
    c = a_Component$bindKeyboard$lambda$_23_3.prototype;
    c.handleEvent = $rt_callWithReceiver(a_Component$bindKeyboard$lambda$_23_3_handleEvent$exported$0);
    c = a_Component$start$lambda$_15_0.prototype;
    c.call = $rt_callWithReceiver(a_Component$start$lambda$_15_0_call$exported$0);
})();
$rt_exports.main = $rt_export_main;
}));
