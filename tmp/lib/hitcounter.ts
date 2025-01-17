import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
  downstream: IFunction;
}

export class HitCounter extends Construct {
  // api gatewayにhandlerを登録するために、publicに露出する必要がある
  public readonly handler: Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // テーブルを定義
    const table = new Table(this, "Hits", {
      partitionKey: { name: "path", type: AttributeType.STRING },
    });

    // handlerを定義
    this.handler = new Function(this, "HitCounterHandler", {
      runtime: Runtime.NODEJS_18_X,
      handler: "hitcounter.handler",
      code: Code.fromAsset("lambda"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName, // lambdaコードに、cdkのコードから渡す
        HITS_TABLE_NAME: table.tableName, // lambdaコードに、cdkのコードから渡す
      },
    });

    // handlerがtableに書き込みすることを許可する
    table.grantReadWriteData(this.handler);

    // handlerがdownstreamをinvokeすることを許可する
    props.downstream.grantInvoke(this.handler);
  }
}
