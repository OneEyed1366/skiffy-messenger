import 'package:auto_route/auto_route.dart';
import 'package:skiffy/features/counter/view/counter_page.dart';

part 'router.gr.dart';

@AutoRouterConfig(replaceInRouteName: 'Screen|Page|View,Route')
class AppRouter extends RootStackRouter {
  @override
  RouteType get defaultRouteType => const RouteType.material();

  @override
  List<AutoRoute> get routes => [
    AutoRoute(page: CounterRoute.page, initial: true),
  ];
}
