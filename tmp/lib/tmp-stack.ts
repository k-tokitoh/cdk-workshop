import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class TmpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new Function(this, "HelloHandler", {
      // 第二引数はリソースの名称。コンソールで表示される
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"), // lambda/ 配下をみる
      handler: "hello.handler", // helloというファイルからexportされるhandlerという関数を実行する
    });

    const gateway = new LambdaRestApi(this, "Endpoint", {
      // 第二引数はリソースの名称。コンソールで表示される
      handler: hello,
    });
  }
}
