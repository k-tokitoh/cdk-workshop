#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TmpStack } from '../lib/tmp-stack';

const app = new cdk.App();
new TmpStack(app, 'TmpStack');
