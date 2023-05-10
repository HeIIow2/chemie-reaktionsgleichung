import argparse

from .create_lgs import solve

parser = argparse.ArgumentParser(description='Reaktionsgleichung')
parser.add_argument('reaktionsgleichung', type=str, help='H2 + O2 = H2O')
parser.add_argument('-s', '--show', action='store_true', help='show steps')

args = parser.parse_args()

print(solve(args.reaktionsgleichung, args.show))
