using System.Collections.Generic;
using NUnit.Framework;
using ARLab.Electronics;
using ARLab.Simulation;

namespace ARLab.Tests
{
    public class TruthTableEvaluatorTests
    {
        [Test]
        public void TruthTableEvaluatesRowsInStandardMsbFirstOrder()
        {
            var graph = new ConnectionGraph();
            var sim = new DigitalLogicSimulator(graph);
            var evaluator = new TruthTableEvaluator(sim);

            var expr = BooleanExpression.Parse("A'B + AB'");
            Assert.IsTrue(expr.IsValid);

            // Mock an ideal circuit evaluator that reflects A XOR B
            InputSwitch sa = null;
            InputSwitch sb = null;
            TruthTableResult res = evaluator.Evaluate(expr, () =>
            {
                // Find switches dynamically if registered
                sa = sa ?? TruthTableEvaluator.FindSwitch(sim, "A");
                sb = sb ?? TruthTableEvaluator.FindSwitch(sim, "B");
                bool a = sa != null && sa.Position == LogicValue.High;
                bool b = sb != null && sb.Position == LogicValue.High;
                return (a ^ b) ? LogicValue.High : LogicValue.Low;
            });

            Assert.AreEqual(4, res.Rows.Count);

            // Row 0: A=0, B=0 -> Exp=0
            Assert.AreEqual('0', res.Rows[0].VarA);
            Assert.AreEqual('0', res.Rows[0].VarB);
            Assert.IsFalse(res.Rows[0].Expected);

            // Row 1: A=0, B=1 -> Exp=1
            Assert.AreEqual('0', res.Rows[1].VarA);
            Assert.AreEqual('1', res.Rows[1].VarB);
            Assert.IsTrue(res.Rows[1].Expected);

            // Row 2: A=1, B=0 -> Exp=1
            Assert.AreEqual('1', res.Rows[2].VarA);
            Assert.AreEqual('0', res.Rows[2].VarB);
            Assert.IsTrue(res.Rows[2].Expected);

            // Row 3: A=1, B=1 -> Exp=0
            Assert.AreEqual('1', res.Rows[3].VarA);
            Assert.AreEqual('1', res.Rows[3].VarB);
            Assert.IsFalse(res.Rows[3].Expected);
        }

        [Test]
        public void FloatingOutputFlagsRowStatusUndefined()
        {
            var graph = new ConnectionGraph();
            var sim = new DigitalLogicSimulator(graph);
            var evaluator = new TruthTableEvaluator(sim);

            var expr = BooleanExpression.Parse("AB");
            TruthTableResult res = evaluator.Evaluate(expr, () => LogicValue.Undefined);

            Assert.AreEqual(4, res.Rows.Count);
            for (int i = 0; i < 4; i++)
            {
                Assert.AreEqual(RowStatus.Undefined, res.Rows[i].Status);
            }
            Assert.IsFalse(res.AllCorrect);
            StringAssert.Contains("Undefined output indicates a floating or unpowered net", res.Summary);
        }
    }
}
