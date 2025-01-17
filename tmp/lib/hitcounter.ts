import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
  downstream: IFunction;
}

export class HitCounter extends Construct {
  // api gatewayにhandlerを登録するために、publicに露出する必要がある
  public readonly handler: Function;

  // dynamo table viewerにtableを登録するために、publicに露出する必要がある
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // テーブルを定義
    this.table = new Table(this, "Hits", {
      partitionKey: { name: "path", type: AttributeType.STRING },
      // RETAIN_ON_UPDATE_OR_DELETE: 未使用な場合のみ削除する
      // SNAPSHOT: 削除するけどスナップショットをとっておく
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // handlerを定義
    this.handler = new Function(this, "HitCounterHandler", {
      runtime: Runtime.NODEJS_18_X,
      handler: "hitcounter.handler",
      code: Code.fromAsset("lambda"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName, // lambdaコードに、cdkのコードから渡す
        HITS_TABLE_NAME: this.table.tableName, // lambdaコードに、cdkのコードから渡す
      },
    });

    // handlerがtableに書き込みすることを許可する
    this.table.grantReadWriteData(this.handler);

    // handlerがdownstreamをinvokeすることを許可する
    props.downstream.grantInvoke(this.handler);
  }
}
