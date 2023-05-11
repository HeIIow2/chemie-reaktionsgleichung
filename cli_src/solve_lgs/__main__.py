import argparse

from .create_lgs import solve

REACTION_LIST = (
    "H2 + O2 = H2O",
    "C3H6O3 + O2 = H2O + CO2",
    "NaOH + CO2 = Na2CO3 + H2O",
    "C8H18 + O2 = CO2 + H2O",
    "C12H22O11 + H2SO4 = C + H2O + H2SO4",
    "C3H8 + O2 = CO2 + H2O",
    "C6H12O6 + O2 = CO2 + H2O",
    "C7H16 + O2 = CO2 + H2O",
    "C4H10 + O2 = CO2 + H2O",
    "C8H18 + O2 = CO2 + H2O",
    "C3H8O3 + HNO3 = CH3NO3 + CH3COOH + H2O",
    "C6H5CH3 + KMnO4 = CO2 + H2O + MnO2 + KCl",
    "C6H5CH3 + Br2 = C6H5CHBr2 + HBr",
)

parser = argparse.ArgumentParser(description='Reaktionsgleichung')
parser.add_argument('reaktionsgleichung', type=str, help='"H2 + O2 = H2O" or "demo"')
parser.add_argument('-s', '--show', action='store_true', help='show steps')

args = parser.parse_args()

if args.reaktionsgleichung == "demo":
    for reaktion in REACTION_LIST:
        print(solve(reaktion, args.show))
else:
    print(solve(args.reaktionsgleichung, args.show))
