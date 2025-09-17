// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'storage.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$SecureStorageError {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'SecureStorageError()';
}


}

/// @nodoc
class $SecureStorageErrorCopyWith<$Res>  {
$SecureStorageErrorCopyWith(SecureStorageError _, $Res Function(SecureStorageError) __);
}


/// Adds pattern-matching-related methods to [SecureStorageError].
extension SecureStorageErrorPatterns on SecureStorageError {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( SecureStorageError_KeyNotFound value)?  keyNotFound,TResult Function( SecureStorageError_AccessDenied value)?  accessDenied,TResult Function( SecureStorageError_BackendNotAvailable value)?  backendNotAvailable,TResult Function( SecureStorageError_InvalidInput value)?  invalidInput,TResult Function( SecureStorageError_Internal value)?  internal,required TResult orElse(),}){
final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound() when keyNotFound != null:
return keyNotFound(_that);case SecureStorageError_AccessDenied() when accessDenied != null:
return accessDenied(_that);case SecureStorageError_BackendNotAvailable() when backendNotAvailable != null:
return backendNotAvailable(_that);case SecureStorageError_InvalidInput() when invalidInput != null:
return invalidInput(_that);case SecureStorageError_Internal() when internal != null:
return internal(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( SecureStorageError_KeyNotFound value)  keyNotFound,required TResult Function( SecureStorageError_AccessDenied value)  accessDenied,required TResult Function( SecureStorageError_BackendNotAvailable value)  backendNotAvailable,required TResult Function( SecureStorageError_InvalidInput value)  invalidInput,required TResult Function( SecureStorageError_Internal value)  internal,}){
final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound():
return keyNotFound(_that);case SecureStorageError_AccessDenied():
return accessDenied(_that);case SecureStorageError_BackendNotAvailable():
return backendNotAvailable(_that);case SecureStorageError_InvalidInput():
return invalidInput(_that);case SecureStorageError_Internal():
return internal(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( SecureStorageError_KeyNotFound value)?  keyNotFound,TResult? Function( SecureStorageError_AccessDenied value)?  accessDenied,TResult? Function( SecureStorageError_BackendNotAvailable value)?  backendNotAvailable,TResult? Function( SecureStorageError_InvalidInput value)?  invalidInput,TResult? Function( SecureStorageError_Internal value)?  internal,}){
final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound() when keyNotFound != null:
return keyNotFound(_that);case SecureStorageError_AccessDenied() when accessDenied != null:
return accessDenied(_that);case SecureStorageError_BackendNotAvailable() when backendNotAvailable != null:
return backendNotAvailable(_that);case SecureStorageError_InvalidInput() when invalidInput != null:
return invalidInput(_that);case SecureStorageError_Internal() when internal != null:
return internal(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function( String key)?  keyNotFound,TResult Function( String key)?  accessDenied,TResult Function( String reason)?  backendNotAvailable,TResult Function( String message)?  invalidInput,TResult Function( String message)?  internal,required TResult orElse(),}) {final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound() when keyNotFound != null:
return keyNotFound(_that.key);case SecureStorageError_AccessDenied() when accessDenied != null:
return accessDenied(_that.key);case SecureStorageError_BackendNotAvailable() when backendNotAvailable != null:
return backendNotAvailable(_that.reason);case SecureStorageError_InvalidInput() when invalidInput != null:
return invalidInput(_that.message);case SecureStorageError_Internal() when internal != null:
return internal(_that.message);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function( String key)  keyNotFound,required TResult Function( String key)  accessDenied,required TResult Function( String reason)  backendNotAvailable,required TResult Function( String message)  invalidInput,required TResult Function( String message)  internal,}) {final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound():
return keyNotFound(_that.key);case SecureStorageError_AccessDenied():
return accessDenied(_that.key);case SecureStorageError_BackendNotAvailable():
return backendNotAvailable(_that.reason);case SecureStorageError_InvalidInput():
return invalidInput(_that.message);case SecureStorageError_Internal():
return internal(_that.message);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function( String key)?  keyNotFound,TResult? Function( String key)?  accessDenied,TResult? Function( String reason)?  backendNotAvailable,TResult? Function( String message)?  invalidInput,TResult? Function( String message)?  internal,}) {final _that = this;
switch (_that) {
case SecureStorageError_KeyNotFound() when keyNotFound != null:
return keyNotFound(_that.key);case SecureStorageError_AccessDenied() when accessDenied != null:
return accessDenied(_that.key);case SecureStorageError_BackendNotAvailable() when backendNotAvailable != null:
return backendNotAvailable(_that.reason);case SecureStorageError_InvalidInput() when invalidInput != null:
return invalidInput(_that.message);case SecureStorageError_Internal() when internal != null:
return internal(_that.message);case _:
  return null;

}
}

}

/// @nodoc


class SecureStorageError_KeyNotFound extends SecureStorageError {
  const SecureStorageError_KeyNotFound({required this.key}): super._();
  

 final  String key;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SecureStorageError_KeyNotFoundCopyWith<SecureStorageError_KeyNotFound> get copyWith => _$SecureStorageError_KeyNotFoundCopyWithImpl<SecureStorageError_KeyNotFound>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError_KeyNotFound&&(identical(other.key, key) || other.key == key));
}


@override
int get hashCode => Object.hash(runtimeType,key);

@override
String toString() {
  return 'SecureStorageError.keyNotFound(key: $key)';
}


}

/// @nodoc
abstract mixin class $SecureStorageError_KeyNotFoundCopyWith<$Res> implements $SecureStorageErrorCopyWith<$Res> {
  factory $SecureStorageError_KeyNotFoundCopyWith(SecureStorageError_KeyNotFound value, $Res Function(SecureStorageError_KeyNotFound) _then) = _$SecureStorageError_KeyNotFoundCopyWithImpl;
@useResult
$Res call({
 String key
});




}
/// @nodoc
class _$SecureStorageError_KeyNotFoundCopyWithImpl<$Res>
    implements $SecureStorageError_KeyNotFoundCopyWith<$Res> {
  _$SecureStorageError_KeyNotFoundCopyWithImpl(this._self, this._then);

  final SecureStorageError_KeyNotFound _self;
  final $Res Function(SecureStorageError_KeyNotFound) _then;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? key = null,}) {
  return _then(SecureStorageError_KeyNotFound(
key: null == key ? _self.key : key // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class SecureStorageError_AccessDenied extends SecureStorageError {
  const SecureStorageError_AccessDenied({required this.key}): super._();
  

 final  String key;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SecureStorageError_AccessDeniedCopyWith<SecureStorageError_AccessDenied> get copyWith => _$SecureStorageError_AccessDeniedCopyWithImpl<SecureStorageError_AccessDenied>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError_AccessDenied&&(identical(other.key, key) || other.key == key));
}


@override
int get hashCode => Object.hash(runtimeType,key);

@override
String toString() {
  return 'SecureStorageError.accessDenied(key: $key)';
}


}

/// @nodoc
abstract mixin class $SecureStorageError_AccessDeniedCopyWith<$Res> implements $SecureStorageErrorCopyWith<$Res> {
  factory $SecureStorageError_AccessDeniedCopyWith(SecureStorageError_AccessDenied value, $Res Function(SecureStorageError_AccessDenied) _then) = _$SecureStorageError_AccessDeniedCopyWithImpl;
@useResult
$Res call({
 String key
});




}
/// @nodoc
class _$SecureStorageError_AccessDeniedCopyWithImpl<$Res>
    implements $SecureStorageError_AccessDeniedCopyWith<$Res> {
  _$SecureStorageError_AccessDeniedCopyWithImpl(this._self, this._then);

  final SecureStorageError_AccessDenied _self;
  final $Res Function(SecureStorageError_AccessDenied) _then;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? key = null,}) {
  return _then(SecureStorageError_AccessDenied(
key: null == key ? _self.key : key // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class SecureStorageError_BackendNotAvailable extends SecureStorageError {
  const SecureStorageError_BackendNotAvailable({required this.reason}): super._();
  

 final  String reason;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SecureStorageError_BackendNotAvailableCopyWith<SecureStorageError_BackendNotAvailable> get copyWith => _$SecureStorageError_BackendNotAvailableCopyWithImpl<SecureStorageError_BackendNotAvailable>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError_BackendNotAvailable&&(identical(other.reason, reason) || other.reason == reason));
}


@override
int get hashCode => Object.hash(runtimeType,reason);

@override
String toString() {
  return 'SecureStorageError.backendNotAvailable(reason: $reason)';
}


}

/// @nodoc
abstract mixin class $SecureStorageError_BackendNotAvailableCopyWith<$Res> implements $SecureStorageErrorCopyWith<$Res> {
  factory $SecureStorageError_BackendNotAvailableCopyWith(SecureStorageError_BackendNotAvailable value, $Res Function(SecureStorageError_BackendNotAvailable) _then) = _$SecureStorageError_BackendNotAvailableCopyWithImpl;
@useResult
$Res call({
 String reason
});




}
/// @nodoc
class _$SecureStorageError_BackendNotAvailableCopyWithImpl<$Res>
    implements $SecureStorageError_BackendNotAvailableCopyWith<$Res> {
  _$SecureStorageError_BackendNotAvailableCopyWithImpl(this._self, this._then);

  final SecureStorageError_BackendNotAvailable _self;
  final $Res Function(SecureStorageError_BackendNotAvailable) _then;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? reason = null,}) {
  return _then(SecureStorageError_BackendNotAvailable(
reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class SecureStorageError_InvalidInput extends SecureStorageError {
  const SecureStorageError_InvalidInput({required this.message}): super._();
  

 final  String message;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SecureStorageError_InvalidInputCopyWith<SecureStorageError_InvalidInput> get copyWith => _$SecureStorageError_InvalidInputCopyWithImpl<SecureStorageError_InvalidInput>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError_InvalidInput&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,message);

@override
String toString() {
  return 'SecureStorageError.invalidInput(message: $message)';
}


}

/// @nodoc
abstract mixin class $SecureStorageError_InvalidInputCopyWith<$Res> implements $SecureStorageErrorCopyWith<$Res> {
  factory $SecureStorageError_InvalidInputCopyWith(SecureStorageError_InvalidInput value, $Res Function(SecureStorageError_InvalidInput) _then) = _$SecureStorageError_InvalidInputCopyWithImpl;
@useResult
$Res call({
 String message
});




}
/// @nodoc
class _$SecureStorageError_InvalidInputCopyWithImpl<$Res>
    implements $SecureStorageError_InvalidInputCopyWith<$Res> {
  _$SecureStorageError_InvalidInputCopyWithImpl(this._self, this._then);

  final SecureStorageError_InvalidInput _self;
  final $Res Function(SecureStorageError_InvalidInput) _then;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,}) {
  return _then(SecureStorageError_InvalidInput(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class SecureStorageError_Internal extends SecureStorageError {
  const SecureStorageError_Internal({required this.message}): super._();
  

 final  String message;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SecureStorageError_InternalCopyWith<SecureStorageError_Internal> get copyWith => _$SecureStorageError_InternalCopyWithImpl<SecureStorageError_Internal>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SecureStorageError_Internal&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,message);

@override
String toString() {
  return 'SecureStorageError.internal(message: $message)';
}


}

/// @nodoc
abstract mixin class $SecureStorageError_InternalCopyWith<$Res> implements $SecureStorageErrorCopyWith<$Res> {
  factory $SecureStorageError_InternalCopyWith(SecureStorageError_Internal value, $Res Function(SecureStorageError_Internal) _then) = _$SecureStorageError_InternalCopyWithImpl;
@useResult
$Res call({
 String message
});




}
/// @nodoc
class _$SecureStorageError_InternalCopyWithImpl<$Res>
    implements $SecureStorageError_InternalCopyWith<$Res> {
  _$SecureStorageError_InternalCopyWithImpl(this._self, this._then);

  final SecureStorageError_Internal _self;
  final $Res Function(SecureStorageError_Internal) _then;

/// Create a copy of SecureStorageError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,}) {
  return _then(SecureStorageError_Internal(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
