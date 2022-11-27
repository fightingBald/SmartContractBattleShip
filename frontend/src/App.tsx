import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import { BigNumber } from 'ethers'
import { Rings } from 'react-loader-spinner'

type Canceler = () => void
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}
const useWindowSize = () => {
  const [size, setSize] = useState({ height: 0, width: 0 })
  const compute = useCallback(() => {
    const height = Math.min(window.innerHeight, 800)
    const width = Math.min(window.innerWidth, 800)
    if (height < width) setSize({ height, width: height })
    else setSize({ height: width, width })
  }, [])
  useEffect(() => {
    compute()
    window.addEventListener('resize', compute)
    return () => window.addEventListener('resize', compute)
  }, [compute])
  return size
}
const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()
  const [ship1, setShip1] = useState<main.MyShip>()
  const [ship2, setShip2] = useState<main.MyShip>()
  const [ship3, setShip3] = useState<main.MyShip>()
  const [ship4, setShip4] = useState<main.MyShip>()

  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    const ship_1 = await main.ship1(details_)
    const ship_2 = await main.ship2(details_)
    const ship_3 = await main.ship3(details_)
    const ship_4 = await main.ship4(details_)

    if (!contract_) return
    if (!ship_1) return
    if (!ship_2) return
    if (!ship_3) return
    if (!ship_4) return

    setContract(contract_)
    setShip1(ship_1)
    setShip2(ship_2)
    setShip3(ship_3)
    setShip4(ship_4)
  }, [])
  return useMemo(() => {
    if (!details || !contract || !ship1 || !ship2 || !ship3 || !ship4) return
    return { details, contract, ship1, ship2, ship3, ship4}
  }, [details, contract, ship1, ship2, ship3, ship4])
}
type Ship = {}
const useBoard = (wallet: ReturnType<typeof useWallet>) => {
  const [board, setBoard] = useState<(null | Ship)[][]>([])
  useAffect(async () => {
    if (!wallet) return
    const onRegistered = (
      id: BigNumber,
      owner: string,
      x: BigNumber,
      y: BigNumber
    ) => {
      console.log('onRegistered')
      setBoard(board => {
        return board.map((x_, index) => {
          if (index !== x.toNumber()) return x_
          return x_.map((y_, indey) => {
            if (indey !== y.toNumber()) return y_
            return { owner, index: id.toNumber() }
          })
        })
      })
    }
    const onTouched = (id: BigNumber, x_: BigNumber, y_: BigNumber) => {
      console.log('onTouched')
      alert('Touched')
      const x = x_.toNumber()
      const y = y_.toNumber()
      setBoard(board => {
        return board.map((x_, index) => {
          if (index !== x) return x_
          return x_.map((y_, indey) => {
            if (indey !== y) return y_
            return null
          })
        })
      })
    }
    const updateSize = async () => {
      const [event] = await wallet.contract.queryFilter('Size', 0)
      const width = event.args.width.toNumber()
      const height = event.args.height.toNumber()
      const content = new Array(width).fill(0)
      const final = content.map(() => new Array(height).fill(null))
      setBoard(final)
    }
    const updateRegistered = async () => {
      const registeredEvent = await wallet.contract.queryFilter('Registered', 0)
      registeredEvent.forEach(event => {
        const { index, owner, x, y } = event.args
        onRegistered(index, owner, x, y)
      })
    }
    const updateTouched = async () => {
      const touchedEvent = await wallet.contract.queryFilter('Touched', 0)
      touchedEvent.forEach(event => {
        const { ship, x, y } = event.args
        onTouched(ship, x, y)
      })
    }
    await updateSize()
    await updateRegistered()
    await updateTouched()
    console.log('Registering')
    wallet.contract.on('Registered', onRegistered)
    wallet.contract.on('Touched', onTouched)
    return () => {
      console.log('Unregistering')
      wallet.contract.off('Registered', onRegistered)
      wallet.contract.off('Touched', onTouched)
    }
  }, [wallet])
  return board
}

const Buttons = ({ wallet, num, setter, loader}: { wallet: ReturnType<typeof useWallet>, num: number, setter : Function, loader: Function}) => {
  const next = async () => {
    loader(true)
    await wallet?.contract.turn().then(loader(false))
  }
  const registerNewShip = async () => {
    loader(true)
    await wallet?.contract.register(main.getShip(num))
    .then (loader(false));
    setter(true);
 
  }
  return (
    <div style={{ display: 'flex', gap: 5, padding: 5 }}>
      <button onClick={registerNewShip}>Register</button>
      <button onClick={next}>Turn</button>
    </div>
  )
}

const CELLS = new Array(100 * 100)
export const App = () => {
  const [playersCount, setPlayersCount] = useState(1);
  const [playerShips, setPlayerShips] = useState(0)
  const [shipRegistered, setShipRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cpt, setCpt] = useState(1);
  const [postionMode, setPositionMode] = useState(true);
  const wallet = useWallet()
  const board = useBoard(wallet)
  const size = useWindowSize()
  const st = {
    ...size,
    gridTemplateRows: `repeat(${board?.length ?? 0}, 1fr)`,
    gridTemplateColumns: `repeat(${board?.[0]?.length ?? 0}, 1fr)`,
  }
  useEffect(() => {
    alert('Welcome to touché coulé ! ')
    alert('First player turn :\n Pick the place of your 2 ships\n The registration of a ship in the game board is a 3 steps process \n 1 - Click on a case to set the postion of the ship and sign the transaction\n 2 - Click on the case when you want your ship to fire and sign the transaction \n 3 - Finally click on the register button to register the contract on the main contract of the borad')
  }, [])

  if (shipRegistered){
   setCpt(cpt+1);
   setShipRegistered(!shipRegistered)
  }

  const onSuccessSelection = () => {
    setPositionMode(!postionMode);
    alert('Select target position to fire')
    setIsLoading(false);
  }
  const selectShipPos = async ( x: number , y:number) => {
    setIsLoading(true);
    if (playersCount ===2){
      if(playerShips === 0){
        await wallet?.ship3.setShipPostion(x,y).then(onSuccessSelection);
      }
      if(playerShips === 1){
        await wallet?.ship4.setShipPostion(x,y).then(onSuccessSelection);
      } 
    } else {
      if(playerShips === 0){
        await wallet?.ship1.setShipPostion(x,y).then(onSuccessSelection);
      }
      if(playerShips === 1){
        await wallet?.ship2.setShipPostion(x,y).then(onSuccessSelection);
      } 
    }
  }

  const onSuccessFire = () => {
    setPositionMode(!postionMode)
    setPlayerShips(playerShips+1)
    alert('Click on the register button to register your ship')
    setIsLoading(false)
  }
  const selectTargetPos = async ( x: number , y:number) => {
    setIsLoading(true);
    if (playersCount ===2){
      if(playerShips === 0){
        await wallet?.ship3.setTargetPostion(x,y) 
        .then(onSuccessFire);
      }
      if(playerShips === 1){
        await wallet?.ship4.setTargetPostion(x,y)
        .then(onSuccessFire);
      } 
    } else {
      if(playerShips === 0){
        await wallet?.ship1.setTargetPostion(x,y)
        .then(onSuccessFire);
      }
      if(playerShips === 1){
        await wallet?.ship2.setTargetPostion(x,y)
        .then(onSuccessFire);
      } 
    }
  }
  useEffect(() => {
    if (cpt === 2 || cpt === 4){
      alert ('Pick your second ship')
    }
    if ( cpt === 3){
      setIsLoading(true)
      setPlayerShips(0);
      setPlayersCount(2);
      alert("Player 2 turn !\n Connect your wallet !")
      setIsLoading(false)
    }
    if ( cpt === 5){
      alert('Click on turn button to start the party')
    }
  }, [cpt])


  return (
    <React.Fragment>  
    <div className={styles.body}>
      <h1>Welcome to Touché Coulé</h1>
      {isLoading ? 
        <Rings
          height="200"
          width="200"
          radius="9"
          color="red"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass 
        />  : 
        <div className={styles.grid} style={st}>
        {CELLS.fill(0).map((_, index) => {
          const x = Math.floor(index % board?.length ?? 0)
          const y = Math.floor(index / board?.[0]?.length ?? 0)
          const background = board?.[x]?.[y] ? 'red' : 'grey'
          return (
            <div key={index} className={styles.cell} style={{ background }} onClick={() => postionMode ? selectShipPos(x,y) : selectTargetPos(x,y)} />
          )
        })
      }
      </div>
      }
      <Buttons wallet={wallet} num={cpt} setter={setShipRegistered} loader={setIsLoading}/> 
    </div>
    </React.Fragment>
  )
}
