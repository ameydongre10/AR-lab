using System;
using System.Reflection;
using NUnit.Framework;

namespace Runner
{
    class Program
    {
        static int Main(string[] args)
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("  AR-LAB STANDALONE TEST SUITE EXECUTION");
            Console.WriteLine("==================================================");

            int passed = 0;
            int failed = 0;

            Type[] testFixtures = new[]
            {
                typeof(ARLab.Tests.BooleanExpressionTests),
                typeof(ARLab.Tests.ConnectionGraphTests),
                typeof(ARLab.Tests.DigitalLogicSimulatorTests),
                typeof(ARLab.Tests.IcDefinitionTests),
                typeof(ARLab.Tests.LogicValueTests),
                typeof(ARLab.Tests.TruthTableEvaluatorTests),
                typeof(ARLab.Tests.BreadboardGeometryTests),
                typeof(ARLab.Tests.ComponentPinTests)
            };

            foreach (var fixtureType in testFixtures)
            {
                Console.WriteLine($"\nRunning fixture: {fixtureType.Name}");
                var instance = Activator.CreateInstance(fixtureType);
                var methods = fixtureType.GetMethods(BindingFlags.Public | BindingFlags.Instance);

                var setupMethod = fixtureType.GetMethod("SetUp");
                var tearDownMethod = fixtureType.GetMethod("TearDown");

                foreach (var m in methods)
                {
                    if (m.GetCustomAttribute<TestAttribute>() == null) continue;

                    try
                    {
                        setupMethod?.Invoke(instance, null);
                        m.Invoke(instance, null);
                        tearDownMethod?.Invoke(instance, null);
                        Console.WriteLine($"  [PASS] {m.Name}");
                        passed++;
                    }
                    catch (Exception ex)
                    {
                        var realEx = ex is TargetInvocationException tie ? tie.InnerException : ex;
                        Console.WriteLine($"  [FAIL] {m.Name}: {realEx?.Message}");
                        failed++;
                    }
                }
            }

            Console.WriteLine("\n--------------------------------------------------");
            Console.WriteLine($"Test Run Summary: {passed} PASSED, {failed} FAILED, Total: {passed + failed}");
            Console.WriteLine("--------------------------------------------------");

            return failed > 0 ? 1 : 0;
        }
    }
}
