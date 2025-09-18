// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$AuthError {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthError()';
}


}

/// @nodoc
class $AuthErrorCopyWith<$Res>  {
$AuthErrorCopyWith(AuthError _, $Res Function(AuthError) __);
}


/// Adds pattern-matching-related methods to [AuthError].
extension AuthErrorPatterns on AuthError {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( AuthError_Authentication value)?  authentication,TResult Function( AuthError_Storage value)?  storage,TResult Function( AuthError_SessionNotFound value)?  sessionNotFound,TResult Function( AuthError_Network value)?  network,TResult Function( AuthError_InvalidInput value)?  invalidInput,required TResult orElse(),}){
final _that = this;
switch (_that) {
case AuthError_Authentication() when authentication != null:
return authentication(_that);case AuthError_Storage() when storage != null:
return storage(_that);case AuthError_SessionNotFound() when sessionNotFound != null:
return sessionNotFound(_that);case AuthError_Network() when network != null:
return network(_that);case AuthError_InvalidInput() when invalidInput != null:
return invalidInput(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( AuthError_Authentication value)  authentication,required TResult Function( AuthError_Storage value)  storage,required TResult Function( AuthError_SessionNotFound value)  sessionNotFound,required TResult Function( AuthError_Network value)  network,required TResult Function( AuthError_InvalidInput value)  invalidInput,}){
final _that = this;
switch (_that) {
case AuthError_Authentication():
return authentication(_that);case AuthError_Storage():
return storage(_that);case AuthError_SessionNotFound():
return sessionNotFound(_that);case AuthError_Network():
return network(_that);case AuthError_InvalidInput():
return invalidInput(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( AuthError_Authentication value)?  authentication,TResult? Function( AuthError_Storage value)?  storage,TResult? Function( AuthError_SessionNotFound value)?  sessionNotFound,TResult? Function( AuthError_Network value)?  network,TResult? Function( AuthError_InvalidInput value)?  invalidInput,}){
final _that = this;
switch (_that) {
case AuthError_Authentication() when authentication != null:
return authentication(_that);case AuthError_Storage() when storage != null:
return storage(_that);case AuthError_SessionNotFound() when sessionNotFound != null:
return sessionNotFound(_that);case AuthError_Network() when network != null:
return network(_that);case AuthError_InvalidInput() when invalidInput != null:
return invalidInput(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function( String field0)?  authentication,TResult Function( SecureStorageError field0)?  storage,TResult Function()?  sessionNotFound,TResult Function( String field0)?  network,TResult Function( String field0)?  invalidInput,required TResult orElse(),}) {final _that = this;
switch (_that) {
case AuthError_Authentication() when authentication != null:
return authentication(_that.field0);case AuthError_Storage() when storage != null:
return storage(_that.field0);case AuthError_SessionNotFound() when sessionNotFound != null:
return sessionNotFound();case AuthError_Network() when network != null:
return network(_that.field0);case AuthError_InvalidInput() when invalidInput != null:
return invalidInput(_that.field0);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function( String field0)  authentication,required TResult Function( SecureStorageError field0)  storage,required TResult Function()  sessionNotFound,required TResult Function( String field0)  network,required TResult Function( String field0)  invalidInput,}) {final _that = this;
switch (_that) {
case AuthError_Authentication():
return authentication(_that.field0);case AuthError_Storage():
return storage(_that.field0);case AuthError_SessionNotFound():
return sessionNotFound();case AuthError_Network():
return network(_that.field0);case AuthError_InvalidInput():
return invalidInput(_that.field0);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function( String field0)?  authentication,TResult? Function( SecureStorageError field0)?  storage,TResult? Function()?  sessionNotFound,TResult? Function( String field0)?  network,TResult? Function( String field0)?  invalidInput,}) {final _that = this;
switch (_that) {
case AuthError_Authentication() when authentication != null:
return authentication(_that.field0);case AuthError_Storage() when storage != null:
return storage(_that.field0);case AuthError_SessionNotFound() when sessionNotFound != null:
return sessionNotFound();case AuthError_Network() when network != null:
return network(_that.field0);case AuthError_InvalidInput() when invalidInput != null:
return invalidInput(_that.field0);case _:
  return null;

}
}

}

/// @nodoc


class AuthError_Authentication extends AuthError {
  const AuthError_Authentication(this.field0): super._();
  

 final  String field0;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthError_AuthenticationCopyWith<AuthError_Authentication> get copyWith => _$AuthError_AuthenticationCopyWithImpl<AuthError_Authentication>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError_Authentication&&(identical(other.field0, field0) || other.field0 == field0));
}


@override
int get hashCode => Object.hash(runtimeType,field0);

@override
String toString() {
  return 'AuthError.authentication(field0: $field0)';
}


}

/// @nodoc
abstract mixin class $AuthError_AuthenticationCopyWith<$Res> implements $AuthErrorCopyWith<$Res> {
  factory $AuthError_AuthenticationCopyWith(AuthError_Authentication value, $Res Function(AuthError_Authentication) _then) = _$AuthError_AuthenticationCopyWithImpl;
@useResult
$Res call({
 String field0
});




}
/// @nodoc
class _$AuthError_AuthenticationCopyWithImpl<$Res>
    implements $AuthError_AuthenticationCopyWith<$Res> {
  _$AuthError_AuthenticationCopyWithImpl(this._self, this._then);

  final AuthError_Authentication _self;
  final $Res Function(AuthError_Authentication) _then;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? field0 = null,}) {
  return _then(AuthError_Authentication(
null == field0 ? _self.field0 : field0 // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class AuthError_Storage extends AuthError {
  const AuthError_Storage(this.field0): super._();
  

 final  SecureStorageError field0;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthError_StorageCopyWith<AuthError_Storage> get copyWith => _$AuthError_StorageCopyWithImpl<AuthError_Storage>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError_Storage&&(identical(other.field0, field0) || other.field0 == field0));
}


@override
int get hashCode => Object.hash(runtimeType,field0);

@override
String toString() {
  return 'AuthError.storage(field0: $field0)';
}


}

/// @nodoc
abstract mixin class $AuthError_StorageCopyWith<$Res> implements $AuthErrorCopyWith<$Res> {
  factory $AuthError_StorageCopyWith(AuthError_Storage value, $Res Function(AuthError_Storage) _then) = _$AuthError_StorageCopyWithImpl;
@useResult
$Res call({
 SecureStorageError field0
});


$SecureStorageErrorCopyWith<$Res> get field0;

}
/// @nodoc
class _$AuthError_StorageCopyWithImpl<$Res>
    implements $AuthError_StorageCopyWith<$Res> {
  _$AuthError_StorageCopyWithImpl(this._self, this._then);

  final AuthError_Storage _self;
  final $Res Function(AuthError_Storage) _then;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? field0 = null,}) {
  return _then(AuthError_Storage(
null == field0 ? _self.field0 : field0 // ignore: cast_nullable_to_non_nullable
as SecureStorageError,
  ));
}

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SecureStorageErrorCopyWith<$Res> get field0 {
  
  return $SecureStorageErrorCopyWith<$Res>(_self.field0, (value) {
    return _then(_self.copyWith(field0: value));
  });
}
}

/// @nodoc


class AuthError_SessionNotFound extends AuthError {
  const AuthError_SessionNotFound(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError_SessionNotFound);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthError.sessionNotFound()';
}


}




/// @nodoc


class AuthError_Network extends AuthError {
  const AuthError_Network(this.field0): super._();
  

 final  String field0;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthError_NetworkCopyWith<AuthError_Network> get copyWith => _$AuthError_NetworkCopyWithImpl<AuthError_Network>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError_Network&&(identical(other.field0, field0) || other.field0 == field0));
}


@override
int get hashCode => Object.hash(runtimeType,field0);

@override
String toString() {
  return 'AuthError.network(field0: $field0)';
}


}

/// @nodoc
abstract mixin class $AuthError_NetworkCopyWith<$Res> implements $AuthErrorCopyWith<$Res> {
  factory $AuthError_NetworkCopyWith(AuthError_Network value, $Res Function(AuthError_Network) _then) = _$AuthError_NetworkCopyWithImpl;
@useResult
$Res call({
 String field0
});




}
/// @nodoc
class _$AuthError_NetworkCopyWithImpl<$Res>
    implements $AuthError_NetworkCopyWith<$Res> {
  _$AuthError_NetworkCopyWithImpl(this._self, this._then);

  final AuthError_Network _self;
  final $Res Function(AuthError_Network) _then;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? field0 = null,}) {
  return _then(AuthError_Network(
null == field0 ? _self.field0 : field0 // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class AuthError_InvalidInput extends AuthError {
  const AuthError_InvalidInput(this.field0): super._();
  

 final  String field0;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthError_InvalidInputCopyWith<AuthError_InvalidInput> get copyWith => _$AuthError_InvalidInputCopyWithImpl<AuthError_InvalidInput>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthError_InvalidInput&&(identical(other.field0, field0) || other.field0 == field0));
}


@override
int get hashCode => Object.hash(runtimeType,field0);

@override
String toString() {
  return 'AuthError.invalidInput(field0: $field0)';
}


}

/// @nodoc
abstract mixin class $AuthError_InvalidInputCopyWith<$Res> implements $AuthErrorCopyWith<$Res> {
  factory $AuthError_InvalidInputCopyWith(AuthError_InvalidInput value, $Res Function(AuthError_InvalidInput) _then) = _$AuthError_InvalidInputCopyWithImpl;
@useResult
$Res call({
 String field0
});




}
/// @nodoc
class _$AuthError_InvalidInputCopyWithImpl<$Res>
    implements $AuthError_InvalidInputCopyWith<$Res> {
  _$AuthError_InvalidInputCopyWithImpl(this._self, this._then);

  final AuthError_InvalidInput _self;
  final $Res Function(AuthError_InvalidInput) _then;

/// Create a copy of AuthError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? field0 = null,}) {
  return _then(AuthError_InvalidInput(
null == field0 ? _self.field0 : field0 // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$HomeserverError {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError()';
}


}

/// @nodoc
class $HomeserverErrorCopyWith<$Res>  {
$HomeserverErrorCopyWith(HomeserverError _, $Res Function(HomeserverError) __);
}


/// Adds pattern-matching-related methods to [HomeserverError].
extension HomeserverErrorPatterns on HomeserverError {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( HomeserverError_ConnectionTimeout value)?  connectionTimeout,TResult Function( HomeserverError_ReadTimeout value)?  readTimeout,TResult Function( HomeserverError_DnsResolutionFailed value)?  dnsResolutionFailed,TResult Function( HomeserverError_NetworkUnavailable value)?  networkUnavailable,TResult Function( HomeserverError_InvalidUrl value)?  invalidUrl,TResult Function( HomeserverError_NotHttps value)?  notHttps,TResult Function( HomeserverError_NotMatrixServer value)?  notMatrixServer,TResult Function( HomeserverError_MalformedResponse value)?  malformedResponse,TResult Function( HomeserverError_UnsupportedVersion value)?  unsupportedVersion,TResult Function( HomeserverError_ServerError value)?  serverError,required TResult orElse(),}){
final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout() when connectionTimeout != null:
return connectionTimeout(_that);case HomeserverError_ReadTimeout() when readTimeout != null:
return readTimeout(_that);case HomeserverError_DnsResolutionFailed() when dnsResolutionFailed != null:
return dnsResolutionFailed(_that);case HomeserverError_NetworkUnavailable() when networkUnavailable != null:
return networkUnavailable(_that);case HomeserverError_InvalidUrl() when invalidUrl != null:
return invalidUrl(_that);case HomeserverError_NotHttps() when notHttps != null:
return notHttps(_that);case HomeserverError_NotMatrixServer() when notMatrixServer != null:
return notMatrixServer(_that);case HomeserverError_MalformedResponse() when malformedResponse != null:
return malformedResponse(_that);case HomeserverError_UnsupportedVersion() when unsupportedVersion != null:
return unsupportedVersion(_that);case HomeserverError_ServerError() when serverError != null:
return serverError(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( HomeserverError_ConnectionTimeout value)  connectionTimeout,required TResult Function( HomeserverError_ReadTimeout value)  readTimeout,required TResult Function( HomeserverError_DnsResolutionFailed value)  dnsResolutionFailed,required TResult Function( HomeserverError_NetworkUnavailable value)  networkUnavailable,required TResult Function( HomeserverError_InvalidUrl value)  invalidUrl,required TResult Function( HomeserverError_NotHttps value)  notHttps,required TResult Function( HomeserverError_NotMatrixServer value)  notMatrixServer,required TResult Function( HomeserverError_MalformedResponse value)  malformedResponse,required TResult Function( HomeserverError_UnsupportedVersion value)  unsupportedVersion,required TResult Function( HomeserverError_ServerError value)  serverError,}){
final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout():
return connectionTimeout(_that);case HomeserverError_ReadTimeout():
return readTimeout(_that);case HomeserverError_DnsResolutionFailed():
return dnsResolutionFailed(_that);case HomeserverError_NetworkUnavailable():
return networkUnavailable(_that);case HomeserverError_InvalidUrl():
return invalidUrl(_that);case HomeserverError_NotHttps():
return notHttps(_that);case HomeserverError_NotMatrixServer():
return notMatrixServer(_that);case HomeserverError_MalformedResponse():
return malformedResponse(_that);case HomeserverError_UnsupportedVersion():
return unsupportedVersion(_that);case HomeserverError_ServerError():
return serverError(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( HomeserverError_ConnectionTimeout value)?  connectionTimeout,TResult? Function( HomeserverError_ReadTimeout value)?  readTimeout,TResult? Function( HomeserverError_DnsResolutionFailed value)?  dnsResolutionFailed,TResult? Function( HomeserverError_NetworkUnavailable value)?  networkUnavailable,TResult? Function( HomeserverError_InvalidUrl value)?  invalidUrl,TResult? Function( HomeserverError_NotHttps value)?  notHttps,TResult? Function( HomeserverError_NotMatrixServer value)?  notMatrixServer,TResult? Function( HomeserverError_MalformedResponse value)?  malformedResponse,TResult? Function( HomeserverError_UnsupportedVersion value)?  unsupportedVersion,TResult? Function( HomeserverError_ServerError value)?  serverError,}){
final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout() when connectionTimeout != null:
return connectionTimeout(_that);case HomeserverError_ReadTimeout() when readTimeout != null:
return readTimeout(_that);case HomeserverError_DnsResolutionFailed() when dnsResolutionFailed != null:
return dnsResolutionFailed(_that);case HomeserverError_NetworkUnavailable() when networkUnavailable != null:
return networkUnavailable(_that);case HomeserverError_InvalidUrl() when invalidUrl != null:
return invalidUrl(_that);case HomeserverError_NotHttps() when notHttps != null:
return notHttps(_that);case HomeserverError_NotMatrixServer() when notMatrixServer != null:
return notMatrixServer(_that);case HomeserverError_MalformedResponse() when malformedResponse != null:
return malformedResponse(_that);case HomeserverError_UnsupportedVersion() when unsupportedVersion != null:
return unsupportedVersion(_that);case HomeserverError_ServerError() when serverError != null:
return serverError(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  connectionTimeout,TResult Function()?  readTimeout,TResult Function()?  dnsResolutionFailed,TResult Function()?  networkUnavailable,TResult Function()?  invalidUrl,TResult Function()?  notHttps,TResult Function()?  notMatrixServer,TResult Function()?  malformedResponse,TResult Function()?  unsupportedVersion,TResult Function( int field0)?  serverError,required TResult orElse(),}) {final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout() when connectionTimeout != null:
return connectionTimeout();case HomeserverError_ReadTimeout() when readTimeout != null:
return readTimeout();case HomeserverError_DnsResolutionFailed() when dnsResolutionFailed != null:
return dnsResolutionFailed();case HomeserverError_NetworkUnavailable() when networkUnavailable != null:
return networkUnavailable();case HomeserverError_InvalidUrl() when invalidUrl != null:
return invalidUrl();case HomeserverError_NotHttps() when notHttps != null:
return notHttps();case HomeserverError_NotMatrixServer() when notMatrixServer != null:
return notMatrixServer();case HomeserverError_MalformedResponse() when malformedResponse != null:
return malformedResponse();case HomeserverError_UnsupportedVersion() when unsupportedVersion != null:
return unsupportedVersion();case HomeserverError_ServerError() when serverError != null:
return serverError(_that.field0);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  connectionTimeout,required TResult Function()  readTimeout,required TResult Function()  dnsResolutionFailed,required TResult Function()  networkUnavailable,required TResult Function()  invalidUrl,required TResult Function()  notHttps,required TResult Function()  notMatrixServer,required TResult Function()  malformedResponse,required TResult Function()  unsupportedVersion,required TResult Function( int field0)  serverError,}) {final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout():
return connectionTimeout();case HomeserverError_ReadTimeout():
return readTimeout();case HomeserverError_DnsResolutionFailed():
return dnsResolutionFailed();case HomeserverError_NetworkUnavailable():
return networkUnavailable();case HomeserverError_InvalidUrl():
return invalidUrl();case HomeserverError_NotHttps():
return notHttps();case HomeserverError_NotMatrixServer():
return notMatrixServer();case HomeserverError_MalformedResponse():
return malformedResponse();case HomeserverError_UnsupportedVersion():
return unsupportedVersion();case HomeserverError_ServerError():
return serverError(_that.field0);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  connectionTimeout,TResult? Function()?  readTimeout,TResult? Function()?  dnsResolutionFailed,TResult? Function()?  networkUnavailable,TResult? Function()?  invalidUrl,TResult? Function()?  notHttps,TResult? Function()?  notMatrixServer,TResult? Function()?  malformedResponse,TResult? Function()?  unsupportedVersion,TResult? Function( int field0)?  serverError,}) {final _that = this;
switch (_that) {
case HomeserverError_ConnectionTimeout() when connectionTimeout != null:
return connectionTimeout();case HomeserverError_ReadTimeout() when readTimeout != null:
return readTimeout();case HomeserverError_DnsResolutionFailed() when dnsResolutionFailed != null:
return dnsResolutionFailed();case HomeserverError_NetworkUnavailable() when networkUnavailable != null:
return networkUnavailable();case HomeserverError_InvalidUrl() when invalidUrl != null:
return invalidUrl();case HomeserverError_NotHttps() when notHttps != null:
return notHttps();case HomeserverError_NotMatrixServer() when notMatrixServer != null:
return notMatrixServer();case HomeserverError_MalformedResponse() when malformedResponse != null:
return malformedResponse();case HomeserverError_UnsupportedVersion() when unsupportedVersion != null:
return unsupportedVersion();case HomeserverError_ServerError() when serverError != null:
return serverError(_that.field0);case _:
  return null;

}
}

}

/// @nodoc


class HomeserverError_ConnectionTimeout extends HomeserverError {
  const HomeserverError_ConnectionTimeout(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_ConnectionTimeout);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.connectionTimeout()';
}


}




/// @nodoc


class HomeserverError_ReadTimeout extends HomeserverError {
  const HomeserverError_ReadTimeout(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_ReadTimeout);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.readTimeout()';
}


}




/// @nodoc


class HomeserverError_DnsResolutionFailed extends HomeserverError {
  const HomeserverError_DnsResolutionFailed(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_DnsResolutionFailed);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.dnsResolutionFailed()';
}


}




/// @nodoc


class HomeserverError_NetworkUnavailable extends HomeserverError {
  const HomeserverError_NetworkUnavailable(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_NetworkUnavailable);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.networkUnavailable()';
}


}




/// @nodoc


class HomeserverError_InvalidUrl extends HomeserverError {
  const HomeserverError_InvalidUrl(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_InvalidUrl);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.invalidUrl()';
}


}




/// @nodoc


class HomeserverError_NotHttps extends HomeserverError {
  const HomeserverError_NotHttps(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_NotHttps);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.notHttps()';
}


}




/// @nodoc


class HomeserverError_NotMatrixServer extends HomeserverError {
  const HomeserverError_NotMatrixServer(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_NotMatrixServer);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.notMatrixServer()';
}


}




/// @nodoc


class HomeserverError_MalformedResponse extends HomeserverError {
  const HomeserverError_MalformedResponse(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_MalformedResponse);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.malformedResponse()';
}


}




/// @nodoc


class HomeserverError_UnsupportedVersion extends HomeserverError {
  const HomeserverError_UnsupportedVersion(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_UnsupportedVersion);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'HomeserverError.unsupportedVersion()';
}


}




/// @nodoc


class HomeserverError_ServerError extends HomeserverError {
  const HomeserverError_ServerError(this.field0): super._();
  

 final  int field0;

/// Create a copy of HomeserverError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$HomeserverError_ServerErrorCopyWith<HomeserverError_ServerError> get copyWith => _$HomeserverError_ServerErrorCopyWithImpl<HomeserverError_ServerError>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeserverError_ServerError&&(identical(other.field0, field0) || other.field0 == field0));
}


@override
int get hashCode => Object.hash(runtimeType,field0);

@override
String toString() {
  return 'HomeserverError.serverError(field0: $field0)';
}


}

/// @nodoc
abstract mixin class $HomeserverError_ServerErrorCopyWith<$Res> implements $HomeserverErrorCopyWith<$Res> {
  factory $HomeserverError_ServerErrorCopyWith(HomeserverError_ServerError value, $Res Function(HomeserverError_ServerError) _then) = _$HomeserverError_ServerErrorCopyWithImpl;
@useResult
$Res call({
 int field0
});




}
/// @nodoc
class _$HomeserverError_ServerErrorCopyWithImpl<$Res>
    implements $HomeserverError_ServerErrorCopyWith<$Res> {
  _$HomeserverError_ServerErrorCopyWithImpl(this._self, this._then);

  final HomeserverError_ServerError _self;
  final $Res Function(HomeserverError_ServerError) _then;

/// Create a copy of HomeserverError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? field0 = null,}) {
  return _then(HomeserverError_ServerError(
null == field0 ? _self.field0 : field0 // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
