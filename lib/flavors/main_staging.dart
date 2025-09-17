import 'package:skiffy/app/app.dart';
import 'package:skiffy/bootstrap.dart';
import 'package:skiffy/flavors/flavor_config.dart';

void main() {
  FlavorConfig.setFlavor(AppFlavor.staging);
  bootstrap(App.new);
}
