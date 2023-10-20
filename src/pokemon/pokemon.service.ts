import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from "mongoose";
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (e) {
      this.handleExceptions(e);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) { // term === termino de busqueda

    let pokemon: Pokemon;

    if (!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    // MongoID
    if (!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    // name
    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase()});
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

        await pokemon.updateOne(updatePokemonDto);
      }
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (e) {
      this.handleExceptions(e);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} =await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return;
  }

  private handleExceptions(e: any){
    if (e.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(e.keyValue)}`,
      );
    }
    console.log(e);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
