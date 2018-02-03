// tslint:disable:max-line-length
import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('complexity', () => {
    describe('success', () => {
        it('should work with a lower level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1' || (b === '2' && c.d !== e)">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('complexity', source);
        });

        it('should work with a level of complexity customisable', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('complexity', source, [4]);
        });

    });


    describe('failure', () => {
        it('should fail with a higher level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertAnnotated({
                ruleName: 'complexity',
                message: 'The condition complexity (cost \'4\') exceeded the defined limit (cost \'3\'). The conditional expression should be move in the component\'s template.',
                source
            });
        });

    });

    describe('failure', () => {
        it('should fail with a higher level of complexity and a carrier return', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1'
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    && e.f !== '6' && q !== g)">
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertAnnotated({
                ruleName: 'complexity',
                message: 'The condition complexity (cost \'4\') exceeded the defined limit (cost \'3\'). The conditional expression should be move in the component\'s template.',
                source
            });
        });

    });


});
